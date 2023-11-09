import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '@/entity/game';

@Injectable()
export class GameService {
  @InjectRepository(Game)
    gameDao: Repository<Game>;

  async getAll() {
    return {
      games: await this.gameDao.find(),
    };
  }
}
