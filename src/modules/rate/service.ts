import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rate } from '@/entity/rate';

/**
 * 基本上不会暴露给用户的业务
 */
@Injectable()
export class RateService {
  @InjectRepository(Rate)
    rateDao: Repository<Rate>;

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
        botId,
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
      botId,
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
    catch {
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
        botId,
      });
      return ;
    }
    catch {
      throw new Error('delete rate error');
    }
  }
}