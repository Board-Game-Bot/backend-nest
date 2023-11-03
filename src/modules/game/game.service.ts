import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '@/entity/game';

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
