import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { GameService } from './game.service';
import { Game } from '@/entity';
import { AdminGuard } from '@/modules/auth/guard/admin.guard';
import { downloadGame } from '@/utils';


@Controller('/api/game')
export class GameController {
  static HAS_DOWNLOAD: boolean;

  gameService: GameService;

  constructor(gameService: GameService) {
    this.gameService = gameService;
    // 运行时下载游戏
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

  @Post('/list')
  async listGames() {
    return await this.gameService.listGames();
  }

  @Post('/create')
  @UseGuards(AdminGuard)
  async createGame(@Body() body: Game) {
    return await this.gameService.create(body);
  }

  @Post('/delete')
  @UseGuards(AdminGuard)
  async deleteGame(@Body() body: Pick<Game, 'id'>) {
    return await this.gameService.delete(body.id);
  }
}
