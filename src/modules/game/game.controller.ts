import { Controller, Get, Inject, Param } from '@nestjs/common';
import { GameService } from '@/modules/game/game.service';
import { makeFailure, makeSuccess } from '@/utils';

@Controller('/api/game')
export class GameController {
  @Inject()
    gameService: GameService;

  @Get('/all')
  async getAll() {
    try {
      return makeSuccess({
        games: await this.gameService.getAll(),
      });
    }
    catch {
      return makeFailure('服务错误');
    }
  }

  @Get('/:id')
  async getOne(@Param('id') id: string) {
    try {
      return makeSuccess({
        game: await this.gameService.getOne(id),
      });
    }
    catch {
      return makeFailure(`不存在游戏${id}`);
    }
  }
}
