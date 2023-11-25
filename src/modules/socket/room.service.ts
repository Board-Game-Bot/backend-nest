import { Inject, Injectable } from '@nestjs/common';
import { GameService } from './game.service';
import { Room } from './room';
import { GET_SOCKET_SERVER } from './constants';
import { Candidate, Mode } from './types';

@Injectable()
export class RoomService {
  @Inject()
    gameService: GameService;

  makeRoom(gameId: string, candidates: Candidate[], mode: Mode) {
    const room = new Room(gameId, candidates, mode, () => {
      this.gameService.startGame(room, GET_SOCKET_SERVER(), mode);
      room.allPlayerOffEvent('prepare');
    });
  }
}