import { Inject, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { GameService } from './game.service';
import { Room } from './Room';
import { GET_SOCKET_SERVER } from './constants';
import { Mode, Player } from './types';

@Injectable()
export class RoomService {
  @Inject()
    gameService: GameService;

  makeRoom(
    gameId: string,
    players: Player[],
    socketMap: Map<string, Socket>,
    mode: Mode,
    roomId?: string,
  ) {
    const room = new Room(gameId, players, socketMap, mode, roomId, () => {
      this.gameService.startGame(room, GET_SOCKET_SERVER(), mode);
    });
  }
}