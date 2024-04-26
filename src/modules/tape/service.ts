import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { pick } from 'lodash';
import { CreateTapeRequest, DeleteTapeRequest, ListTapesRequest, UpdateTapeRequest } from './dtos';
import { generateId } from './utils';
import { Tape } from '@/entity';
import { RequestFail } from '@/utils';

@Injectable()
export class TapeService {
  @InjectRepository(Tape)
    tapeDao: Repository<Tape>;

  async createTape(userId: string, request: CreateTapeRequest) {
    const filteredRequest = pick(request, ['Name', 'Description', 'GameId', 'Json']);
    const id = generateId();
    await this.tapeDao.save({
      Id: id,
      ...filteredRequest,
      Name: filteredRequest.Name ?? id,
      UserId: userId,
    });
    return id;
  }

  async getTape(id: string) {
    return await this.tapeDao.findOneBy({ Id: id });
  }

  async listTapes(request: ListTapesRequest) {
    const { PageOffset, PageSize } = request;
    const filter = request.Filter ?? {};
    const q = this.tapeDao.createQueryBuilder('tape');
    if (filter.GameIds?.length > 0) {
      q.andWhere('tape.GameId IN (:...GameIds)', filter);
    }
    if (filter.UserIds?.length > 0) {
      q.andWhere('tape.UserId IN (:...UserIds)', filter);
    }

    q.select(<(keyof Tape)[]>['Id', 'Name', 'Description', 'GameId', 'UserId', 'CreateTime'].map(field => `tape.${field}`));
    q.skip(PageOffset).take(PageSize);
    const [items, totalCount] = await q.getManyAndCount();
    return {
      TotalCount: totalCount,
      Items: items,
    };
  }

  async updateTape(userId: string, request: UpdateTapeRequest) {
    const filteredRequest = pick(request, ['Id', 'Name', 'Description']);
    if (!await this.isPermitted(userId, filteredRequest.Id)) {
      RequestFail('You are not permitted to update this Tape.');
    }
    await this.tapeDao.update(filteredRequest.Id, filteredRequest);
  }

  async deleteTape(userId: string, request: DeleteTapeRequest) {
    if (!await this.isPermitted(userId, request.Id)) {
      RequestFail('You are not permitted to update this Tape.');
    }
    await this.tapeDao.delete(request.Id);
  }

  async isPermitted(userId: string, id: string) {
    return await this.tapeDao.exist({
      where: {
        UserId: userId,
        Id: id,
      },
    });
  }
}