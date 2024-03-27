import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { nanoid } from 'nanoid';
import { CodeVo, CreateDto, CreateVo, GetVo, UpdateDto } from './dtos';
import { Bot } from '@/entity';
import { makeFailure } from '@/utils';
import { BotRunService } from '@/modules/botrun/services';

@Injectable()
export class BotService {
  @InjectRepository(Bot)
    botDao: Repository<Bot>;

  @Inject()
    botRunService: BotRunService;

  async create(userId: string, dto: CreateDto): Promise<CreateVo> {
    try {
      const containerId = await this.botRunService.createContainer(dto.langId, dto.code);
      const message = await this.botRunService.compile(containerId);

      if (message) throw new Error(message);

      this.botRunService.stop(containerId);

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
        bots,
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
      const bot = await this.botDao.findOneByOrFail({
        id: dto.id,
        userId,
      });
      if (dto.code) {
        const containerId = await this.botRunService.createContainer(bot.langId, bot.code);
        const message = await this.botRunService.compile(containerId);
        this.botRunService.stop(containerId);
        if (message) throw new Error(message);
      }
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

  async delete(userId: string, botId: string): Promise<void> {
    try {
      if (!await this.botDao.findBy({ id: botId, userId }))
        return;
      await this.botDao.delete(botId);
      return;
    }
    catch (e) {
      console.log('delete bot error: ', e);
      throw new Error('delete bot error');
    }
  }
}