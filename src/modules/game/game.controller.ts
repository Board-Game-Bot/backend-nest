import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { GameService } from './game.service';
import {
  CreateGameRequest,
  CreateGameResponse, DeleteGameRequest,
  GetGameRequest,
  ListGamesRequest,
  ListGamesResponse,
  UpdateGameRequest,
} from '@/request';
import { Game } from '@/entity';
import { AdminGuard } from '@/modules/auth/guard/admin.guard';
import { CommonResponseType, downloadGame, RequestOk } from '@/utils';

@Controller('/api')
export class GameController {
  static HAS_DOWNLOAD: boolean;

  @Inject()
    gameService: GameService;

  constructor(gameService: GameService) {
    this.gameService = gameService;
    // 运行时下载游戏
    if (GameController.HAS_DOWNLOAD) return ;
    GameController.HAS_DOWNLOAD = true;
    gameService.listGames({ PageOffset: 0, PageSize: 999 })
      .then(({ Items }) => {
        for (const { NpmPackage, Version } of Items) {
          downloadGame(NpmPackage, Version);
        }
      });
  }

  @UseGuards(AdminGuard)
  @Post('/CreateGame')
  async createGame(@Body() request: CreateGameRequest): CommonResponseType<CreateGameResponse> {
    const Id = await this.gameService.createGame(request);
    return RequestOk({ Id });
  }

  @Post('/ListGames')
  async listGames(@Body() request: ListGamesRequest): CommonResponseType<ListGamesResponse> {
    return RequestOk(await this.gameService.listGames(request));
  }

  @Post('/GetGame')
  async getGame(@Body() request: GetGameRequest): CommonResponseType<Game> {
    const game = await this.gameService.getGame(request.Id);
    return RequestOk(game);
  }

  @UseGuards(AdminGuard)
  @Post('/UpdateGame')
  async updateGame(@Body() request: UpdateGameRequest): CommonResponseType {
    await this.gameService.updateGame(request);
    return RequestOk({});
  }

  @UseGuards(AdminGuard)
  @Post('/DeleteGame')
  async deleteGame(@Body() body: DeleteGameRequest): CommonResponseType {
    await this.gameService.deleteGame(body.Id);
    return RequestOk({});
  }
}
