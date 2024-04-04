import { Inject, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { OnlineGameService } from './online-game.service';
import { Room } from './Room';
import { GET_SOCKET_SERVER } from './constants';
import { Mode, Player } from './types';

@Injectable()
export class RoomService {
  @Inject()
    onlineGameService: OnlineGameService;

  makeRoom(
    gameId: string,
    players: Player[],
    socketMap: Map<string, Socket>,
    mode: Mode,
    roomId?: string,
  ) {
    const room = new Room(gameId, players, socketMap, mode, roomId, () => {
      this.onlineGameService.startGame(room, GET_SOCKET_SERVER(), mode);
    });
  }
}