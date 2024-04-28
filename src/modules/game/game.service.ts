import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateGameRequest } from '@/request';
import { Game } from '@/entity/game';

@Injectable()
export class GameService {
  @InjectRepository(Game)
    gameDao: Repository<Game>;

  async createGame(game: Game) {
    await this.gameDao.save({ ...game });
    return game.Id;
  }

  async listGames(request: any) {
    const { PageOffset, PageSize } = request;
    const itemsPromise = this.gameDao.find({
      skip: PageOffset,
      take: PageSize,
      select: ['Id', 'Icon', 'PlayerCount', 'NpmPackage', 'Version'],
    });
    const totalCountPromise = this.gameDao.count();
    const [items, totalCount] = await Promise.all([itemsPromise, totalCountPromise]);
    return {
      TotalCount: totalCount,
      Items: items,
    };
  }

  async getGame(id: string) {
    return await this.gameDao.findOneBy({ Id: id });
  }

  async updateGame(request: UpdateGameRequest) {
    const { Id } = request;
    await this.gameDao.update(Id, request);
  }

  async deleteGame(id: string) {
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
