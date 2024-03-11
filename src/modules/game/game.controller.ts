import { Controller, Get } from '@nestjs/common';
import { GameService } from './game.service';
import { downloadGame } from '@/utils';


@Controller('/api/game')
export class GameController {
  static HAS_DOWNLOAD: boolean;

  gameService: GameService;

  constructor(gameService: GameService) {
    this.gameService = gameService;
    if (GameController.HAS_DOWNLOAD) return ;
    GameController.HAS_DOWNLOAD = true;
    gameService.getAll()
      .then(async ({ games }) => {
        for (const { npmPackage, version } of games) {
          await downloadGame(npmPackage, version);
        }
      });
  }

  @Get('/all')
  async getAll() {
    return await this.gameService.getAll();
  }
}
