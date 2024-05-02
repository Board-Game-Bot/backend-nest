import { chunk, flatten, shuffle } from 'lodash';
import { Inject, Injectable } from '@nestjs/common';
import { Rate } from '@/entity/rate';
import { RoomManager } from '@/modules/socket/room';
import { GameService } from '@/modules/game/game.service';
import { Game } from '@/entity';
import { GameMode } from '@/modules/socket/types';
import { SocketMap } from '@/modules/socket/socket-map';
import { SocketResponse } from '@/modules/socket/message';

@Injectable()
export class MatchPools {
  Map = new Map<string, Rate[]>();
  @Inject()
    RoomManager?: RoomManager;
  @Inject()
    GameService: GameService;

  AddUser(gameId: string, _rate: Rate) {
    const pool = this.Map.get(gameId) ?? [];
    if (pool.some(rate => rate.UserId === _rate.UserId)) {
      return false;
    }
    this.Map.set(gameId, [...pool, _rate]);
    return true;
  }

  DelUser(gameId: string, _rate: Rate) {
    const pool = this.Map.get(gameId) ?? [];
    if (pool.every(rate => rate.UserId !== _rate.UserId)) {
      return false;
    }
    this.Map.set(gameId, pool.filter(rate => rate.UserId !== _rate.UserId));
    return true;
  }

  OneLoop (gameId: string) {
    const pool = this.Map.get(gameId) ?? [];
    const shuffledPool = shuffle(pool);
    const chunkedPool = chunk(shuffledPool, 2);

    this.Map.set(gameId, flatten(chunkedPool.filter(rates => rates.length < 2)));

    chunkedPool.forEach(async rates => {
      if (rates.length < 2) {
        return;
      }
      const game = this.Games.find(game => game.Id === gameId)!;
      const id = this.RoomManager.MakeRoom(game, GameMode.Match);
      const sockets = rates.map(rate => SocketMap.get(rate.UserId));
      sockets.forEach(socket => {
        socket.emit(SocketResponse.MakeRoomResponse, id);
      });
    });
  }

  Games: Game[];
  constructor(gameService: GameService) {
    this.GameService = gameService;
    this.Games = [];
    const fetchGames = async () => {
      const { Items } = await gameService.listGames({ PageSize: 100, PageOffset: 0 });
      this.Games = Items;
    };
    fetchGames();
    setInterval(async () => {
      fetchGames();
    }, 1000 * 60 * 60);
    setInterval(() => {
      [...this.Map.keys()].forEach((gameId) => {
        this.OneLoop(gameId);
      });
    }, 2000);
  }
}
