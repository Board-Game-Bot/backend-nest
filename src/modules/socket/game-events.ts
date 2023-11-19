import { buildGame, NewGenerator } from '@soku-games/core';
import { Server } from 'socket.io';
import { Room } from './room';

export function startGame(room: Room, server: Server) {
  // TODO 开始游戏
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

  setTimeout(() => {
    game.start();
  }, 16);
}

