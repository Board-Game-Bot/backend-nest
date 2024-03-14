import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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

  async listGames() {
    return {
      items: await this.gameDao.find(),
    };
  }

  async create(game: Game) {
    try {
      await this.gameDao.save({
        ...game,
        playerCount: parseInt(game.playerCount + ''),
      });
      return;
    }
    catch (e) {
      console.log(e.message);
      throw new HttpException('Create Game Error', HttpStatus.BAD_REQUEST);
    }
  }

  async delete(id: string) {
    try {
      await this.gameDao.delete(id);
      return ;
    }
    catch (e) {
      console.log(e.message);
      throw new HttpException('Delete Game Error', HttpStatus.BAD_REQUEST);
    }
  }
}
