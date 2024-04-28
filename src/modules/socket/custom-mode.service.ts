import { Inject, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Client } from '@/modules/socket/clazz';
import { PreRoom } from '@/modules/socket/PreRoom';
import { GameService } from '@/modules/game/game.service';

@Injectable()
export class CustomModeService {
    @Inject() private gameService: GameService;

    async create(socket: Socket, gameId: string) {
      const client = Client.IdMap.get(socket);

      const game = await this.gameService.getGame(gameId);
      const playerCount = game.PlayerCount;

      new PreRoom(client, gameId, playerCount);
    }

    async join(socket: Socket, roomId: string, gameId: string) {
      const client = Client.IdMap.get(socket);

      const preRoom = PreRoom.IdMap.get(roomId);
      if (preRoom?.gameId !== gameId) return ;

      preRoom.join(client);
    }
}