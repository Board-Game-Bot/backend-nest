import { Injectable, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rate } from '@/entity/rate';

@Injectable()
export class RateService {
  @InjectRepository(Rate)
    rateDao: Repository<Rate>;

  async get(
    @Query('gameId') gameId: string,
    @Query('pageIndex') pageIndex: number,
    @Query('pageSize') pageSize: number,
  ) {
    try {
      return {
        rates: await this.rateDao.find({
          where: {
            gameId,
          },
          order: {
            score: 'DESC',
          },
          skip: pageIndex * pageSize,
          take: pageSize,
        }),
      };
    }
    catch (e) {
      console.log(e);
      throw new Error('get rates error.');
    }
  }

  /**
   * 创建
   * @param userId
   * @param gameId
   * @param botId
   */
  async createRate(
    userId: string,
    gameId: string,
    botId?: string,
  ) {
    try {
      return this.rateDao.save({
        userId,
        gameId,
        botId: botId ?? 'person',
        score: 1500,
      });
    }
    catch {
      throw new Error('create rate error');
    }
  }

  /**
   * 查找
   * @param userId
   * @param gameId
   * @param botId
   */
  async findRate(
    userId: string,
    gameId: string,
    botId?: string,
  ) {
    const foundRate = await this.rateDao.findOneBy({
      userId,
      gameId,
      botId: botId ?? 'person',
    });
    if (foundRate)
      return foundRate;

    // 找不到就创建一个
    return await this.createRate(
      userId,
      gameId,
      botId,
    );
  }

  /**
   * 更新
   * @param userId
   * @param gameId
   * @param botId
   * @param score
   */
  async updateRate(
    userId: string,
    gameId: string,
    botId: string | undefined,
    score: number,
  ) {
    try {
      const rate = await this.findRate(
        userId,
        gameId,
        botId,
      );
      await this.rateDao.update(rate, { score });
      return ;
    }
    catch (e) {
      console.log(e);
      throw new Error('update rate error');
    }
  }

  /**
   * 删除
   * @param userId
   * @param gameId
   * @param botId
   */
  async deleteRate(
    userId: string,
    gameId: string,
    botId?: string,
  ) {
    try {
      await this.rateDao.delete({
        userId,
        gameId,
        botId: botId ?? 'person',
      });
      return ;
    }
    catch {
      throw new Error('delete rate error');
    }
  }
}