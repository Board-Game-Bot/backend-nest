import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { nanoid } from 'nanoid';
import { CreateBotDto, DeleteBotDto, UpdateBotDto } from './dtos';
import { Bot } from '@/entity';
import { makeFailure } from '@/utils';

@Injectable()
export class BotService {
  @InjectRepository(Bot)
    botDao: Repository<Bot>;

  async createBot(userId: string, dto: CreateBotDto) {
    try {
      return await this.botDao.save({
        id: nanoid(),
        userId,
        ...dto,
        isPublic: false,
      });
    }
    catch (e) {
      makeFailure(e.message);
    }
  }

  async requestBot(userId: string) {
    try {
      const bots = await this.botDao.findBy({
        userId,
      });
      return {
        bots,
      };
    }
    catch (e) {
      makeFailure(e.message);
    }
  }

  async seeBot(userId: string) {
    try {
      const bots = await this.botDao.findBy({
        userId,
        isPublic: true,
      });
      return {
        bots,
      };
    }
    catch (e) {
      makeFailure(e.message);
    }
  }

  async updateBot(userId: string, dto: UpdateBotDto) {
    try {
      await this.botDao.findOneByOrFail({
        id: dto.botId,
        userId,
      });
      await this.botDao.update(dto.botId, {
        ...dto,
      });
      return ;
    }
    catch (e) {
      makeFailure(e.message);
    }
  }

  async deleteBot(userId: string, dto: DeleteBotDto) {
    try {
      await this.botDao.findOneByOrFail({
        userId,
        id: dto.botId,
      });
      await this.botDao.delete(dto.botId);
      return ;
    }
    catch (e) {
      makeFailure(e.message);
    }
  }
}