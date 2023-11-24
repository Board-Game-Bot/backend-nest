import { buildGame, NewGenerator } from '@soku-games/core';
import { Server } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { Room } from './room';

@Injectable()
export class GameService {
  startGame(room: Room, server: Server) {
    room.emit('start-game');
    const { gameId, roomId } = room;
    const game = buildGame({
      name: gameId,
      plugins: [
        `${gameId}-validator`,
        {
          name: 'network-server-controller',
          extra: {
            sockets: room.players.map(p => p.socket),
          },
        },
        {
          name: 'network-sync-renderer',
          extra: {
            server,
            roomId,
          },
        },
      ],
    });
    game.prepare(NewGenerator(gameId).generate());
  }
}