import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { pick } from 'lodash';
import { CreateRateRequest, GetRateRequest, ListRatesRequest, OnlyRateId, UpdateRateRequest } from './dtos';
import { Rate } from '@/entity/rate';
import { RequestFail } from '@/utils';

@Injectable()
export class RateService {
  @InjectRepository(Rate)
    rateDao: Repository<Rate>;

  async createRate(request: CreateRateRequest) {
    if (await this.isExist(request)) {
      RequestFail('The Rate already exists.');
    }
    await this.rateDao.save(pick(request, ['BotId', 'UserId', 'GameId', 'Score']));
    return pick(request, ['UserId', 'GameId', 'BotId']);
  }

  async getRate(request: GetRateRequest) {
    if (!await this.isExist(request)) {
      RequestFail('The Rate does not exist.');
    }
    return await this.rateDao.findOneBy(pick(request, ['BotId', 'UserId', 'GameId']));
  }

  async listRates(request: ListRatesRequest) {
    const { PageOffset, PageSize, WithRank } = request;
    const filter = request.Filter ?? {};
    const q = this.rateDao.createQueryBuilder('rate');
    q.addOrderBy('rate.Score', 'DESC');

    if (filter.GameIds?.length > 0) {
      q.andWhere('rate.GameId IN (:...GameIds)', filter);
    }
    if (filter.UserIds?.length > 0) {
      q.andWhere('rate.UserId IN (:...UserIds)', filter);
    }
    if (filter.BotIds?.length > 0) {
      q.andWhere('rate.BotId IN (:...BotIds)', filter);
    }
    if (WithRank) {
      q.addSelect('ROW_NUMBER() OVER (PARTITION BY rate.GameId ORDER BY rate.Score DESC) AS `rate_Rank`');
    }
    q.skip(PageOffset).take(PageSize);
    const [items, totalCount] = await q.getManyAndCount();
    return {
      Items: items,
      TotalCount: totalCount,
    };
  }

  async updateRate(request: UpdateRateRequest) {
    const { UserId, GameId, BotId, Score } = request;
    if (!await this.isExist({ UserId, GameId, BotId })) {
      RequestFail('The Rate does not exist.');
    }
    await this.rateDao.update({ UserId, GameId, BotId }, {
      Score,
      UserId,
      GameId,
      BotId,
    });
  }


  async isExist(request: OnlyRateId) {
    return await this.rateDao.exist({
      where: pick(request, ['UserId', 'GameId', 'BotId']),
    });
  }
}