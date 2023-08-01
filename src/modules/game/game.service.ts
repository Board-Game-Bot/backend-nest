import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from '@/entity/game';
import { Repository } from 'typeorm';

@Injectable()
export class GameService {
  @InjectRepository(Game)
  gameDao: Repository<Game>;

  async getAll() {
    return await this.gameDao.find();
  }

  async getOne(id: string) {
    return await this.gameDao.findOneByOrFail({
      id,
    });
  }
}
