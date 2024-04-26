import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { pick } from 'lodash';
import { CreateBotRequest, ListBotsRequest, UpdateBotRequest } from './dtos';
import { generateId } from './utils';
import { Bot } from '@/entity';
import { RequestFail } from '@/utils';
import { BotRunService } from '@/modules/botrun/services';
import { BotStatus } from '@/types';


@Injectable()
export class BotService {
  @InjectRepository(Bot)
    botDao: Repository<Bot>;

  @Inject()
    botRunService: BotRunService;

  async createBot(userId: string, request: CreateBotRequest) {
    const id = generateId();
    if (!request.Name) {
      request.Name = id;
    }

    await this.botDao.save({
      Id: id,
      UserId: userId,
      ...request,
    });
    return id;
  }

  async listBots(request: ListBotsRequest) {
    const { PageSize, PageOffset } = request;
    const filter = request.Filter ?? {};
    const q = this.botDao.createQueryBuilder('bot');
    if (filter.UserIds) {
      q.andWhere('bot.UserId IN (:...UserIds)', { UserIds: filter.UserIds });
    }
    if (filter.GameIds) {
      q.andWhere('bot.GameId IN (:...GameIds)', { GameIds: filter.GameIds });
    }
    if (filter.Langs) {
      q.andWhere('bot.Lang IN (:...Langs)', { Langs: filter.Langs });
    }
    if (filter.Statuses) {
      q.andWhere('bot.Status IN (:...Statuses)', { Statuses: filter.Statuses });
    }
    q.select(['Id', 'Name', 'Description', 'GameId', 'Lang', 'CreateTime', 'Status', 'StatusMessage', 'UserId'].map(col => `bot.${col}`))
      .skip(PageOffset)
      .take(PageSize);
    const [items, totalCount] = await q.getManyAndCount();

    return {
      TotalCount: totalCount,
      Items: items,
    };
  }

  async getBot(id: string) {
    return await this.botDao.findOneBy({ Id: id });
  }

  async updateBot(userId: string, request: UpdateBotRequest) {

    if (!await this.isPermitted(userId, request.Id)) {
      RequestFail('You are not permitted to update this Bot.');
    }
    await this.botDao.update(request.Id, pick(request, ['Id', 'Description', 'Code', 'Name']));
  }

  async deleteBot(userId: string, id: string) {
    if (!await this.isPermitted(userId, id)) {
      RequestFail('You are not permitted to delete this Bot.');
    }
    await this.botDao.delete(id);
  }

  async startBot(userId: string, id: string) {
    if (!await this.isPermitted(userId, id)) {
      RequestFail('You are not permitted to start this Bot.');
    }
    const bot = await this.botDao.findOneBy({
      UserId: userId,
      Id: id,
    });
    if (![BotStatus.Hibernating, BotStatus.Failed].includes(bot.Status)) {
      RequestFail('You can start the bot only when is in hibernating or failed status.');
    }
    await this.botDao.update(id, {
      Status: BotStatus.Deploying,
    });
    this.botRunService.createContainer(bot.Lang, bot.Code)
      .then(async containerId => {
        await this.botDao.update(id, {
          ContainerId: containerId,
        });
        await this.botRunService.compile(containerId);
      });
    return ;
  }

  async stopBot(userId: string, id: string) {
    if (!await this.isPermitted(userId, id)) {
      RequestFail('You are not permitted to stop this Bot.');
    }
    const bot = await this.botDao.findOneBy({
      UserId: userId,
      Id: id,
    });
    if (bot.Status !== BotStatus.Working) {
      RequestFail('You can stop the bot only when is in working status.');
    }
    const containerId = bot.ContainerId;
    await this.botDao.update(id, {
      Status: BotStatus.Terminating,
    });
    this.botRunService.stop(containerId);
  }

  async innerUpdateBotStatus(containerId: string, status: BotStatus, message?: string): Promise<void> {
    try {
      await this.botDao.update({ ContainerId: containerId }, {
        Status: status,
        StatusMessage: message,
      });
    }
    catch {
      throw new Error('update bot status error') ;
    }
  }

  async isPermitted(userId: string, id: string) {
    return await this.botDao.exist({
      where: {
        Id: id,
        UserId: userId,
      },
    });
  }
}