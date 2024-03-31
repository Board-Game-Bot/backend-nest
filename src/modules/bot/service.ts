import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { nanoid } from 'nanoid';
import { omit } from 'lodash';
import { CodeVo, CreateDto, CreateVo, GetVo, UpdateDto } from './dtos';
import { Bot } from '@/entity';
import { makeFailure } from '@/utils';
import { BotRunService } from '@/modules/botrun/services';
import { BotStatus } from '@/types';

@Injectable()
export class BotService {
  @InjectRepository(Bot)
    botDao: Repository<Bot>;

  @Inject()
    botRunService: BotRunService;

  async create(userId: string, dto: CreateDto): Promise<CreateVo> {
    try {
      const { name, description } = dto;
      return await this.botDao.save({
        id: nanoid(),
        userId,
        ...dto,
        name: name || 'MyBot',
        description: description || '作者很懒，没有任何简介。',
        isPublic: false,
      });
    }
    catch (e) {
      console.log('create bot error: ', e.message);
      makeFailure(e.message);
    }
  }

  async getOne(botId: string) {
    return await this.botDao.findOneBy({ id: botId });
  }

  async get(userId: string, pageIndex: number, pageSize: number): Promise<GetVo> {
    try {
      const bots = await this.botDao.find({
        select: {
          code: false,
        },
        where: {
          userId,
        },
        order: {
          createTime: 'DESC',
        },
        skip: pageIndex * pageSize,
        take: pageSize,
      });
      return {
        bots: bots.map(bot => omit(bot, 'containerId')),
      };
    }
    catch (e) {
      console.log('get bot error: ', e);
      throw new Error('get bot error');
    }
  }

  async game(userId: string, gameId: string) {
    return await this.botDao.findBy({
      userId,
      gameId,
    });
  }

  async code(userId: string, botId: string): Promise<CodeVo> {
    try {
      return await this.botDao.findOne({
        select: ['code'],
        where: {
          id: botId,
          userId,
        },
      });
    }
    catch (e) {
      console.log('code bot error:', e);
      throw new Error('code bot error');
    }
  }

  async update(userId: string, dto: UpdateDto): Promise<void> {
    try {
      await this.botDao.findOneByOrFail({
        id: dto.id,
        userId,
      });
      await this.botDao.update(dto.id, {
        ...dto,
      });
      return ;
    }
    catch (e) {
      console.log('update bot error: ', e);
      makeFailure('update bot error');
    }
  }

  async compile(userId: string, botId: string): Promise<void> {
    try {
      const bot = await this.botDao.findOneByOrFail({
        id: botId,
        userId,
      });
      await this.botDao.update(botId, {
        status: BotStatus.Deploying,
      });

      (async () => {
        const containerId = await this.botRunService.createContainer(bot.langId, bot.code);
        await this.botDao.update(botId, {
          containerId,
        });
        this.botRunService.compile(containerId);
      })();
      return ;
    }
    catch(e) {
      console.log('compile bot error: ', e);
      makeFailure('compile bot error');
    }
  }

  async stop(userId: string, botId: string): Promise<void> {
    try {
      const bot = await this.botDao.findOneByOrFail({
        id: botId,
        userId,
      });
      const containerId = bot.containerId;
      await this.botDao.update(botId, {
        status: BotStatus.Terminating,
      });
      this.botRunService.stop(containerId);
    }
    catch (e) {
      console.log('stop bot error: ', e);
      makeFailure('stop bot error');
    }
  }

  async delete(userId: string, botId: string): Promise<void> {
    try {
      const bot = await this.botDao.findOneBy({ id: botId, userId });
      if (!bot)
        return;
      const containerId = bot.containerId;
      if (containerId) {
        this.botRunService.stop(containerId);
      }
      await this.botDao.delete(botId);
      return;
    }
    catch (e) {
      console.log('delete bot error: ', e);
      throw new Error('delete bot error');
    }
  }

  async innerUpdateStatus(containerId: string, status: BotStatus, message?: string): Promise<void> {
    try {
      await this.botDao.update({ containerId }, {
        status,
        statusMessage: message,
      });
    }
    catch {
      throw new Error('update bot status error') ;
    }
  }
}