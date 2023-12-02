import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { nanoid } from 'nanoid';
import { CodeVo, CreateDto, CreateVo, GetVo, UpdateDto } from './dtos';
import { Bot } from '@/entity';
import { API, makeFailure } from '@/utils';

@Injectable()
export class BotService {
  @InjectRepository(Bot)
    botDao: Repository<Bot>;

  async create(userId: string, dto: CreateDto): Promise<CreateVo> {
    let containerId: string;
    try {
      containerId = (await API.post('/create', {
        lang: dto.langId,
        code: dto.code,
      })).data.containerId;
      const message = (await API.post('/compile', {
        containerId,
      })).data.message;
      if (message) {
        throw new Error(message);
      }

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
    finally {
      if (containerId)
        await API.post('/stop', {
          containerId,
        });
    }
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
      throw new Error('update bot error');
    }
  }

  async delete(userId: string, botId: string): Promise<void> {
    try {
      await this.botDao.delete(botId);
      return ;
    }
    catch (e) {
      console.log('delete bot error: ', e);
      throw new Error('delete bot error');
    }
  }
}