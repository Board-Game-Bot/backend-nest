import { Controller, Get, Inject } from '@nestjs/common';
import { GameService } from './game.service';


@Controller('/api/game')
export class GameController {
  @Inject()
    gameService: GameService;

  @Get('/all')
  async getAll() {
    return await this.gameService.getAll();
  }
}
