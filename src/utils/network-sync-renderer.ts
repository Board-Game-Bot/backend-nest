import { Game, GamePlugin, GamePluginImpl, LifeCycle } from '@soku-games/core';
import { Server } from 'socket.io';

@GamePluginImpl('network-sync-renderer')
export class NetworkSyncRenderer extends GamePlugin {
  bindGame(game: Game, extra?: { server: Server, roomId: string }): void | Record<string, any> {
    const s = extra?.server;
    const roomId = extra?.roomId;

    game.subscribe(LifeCycle.BEFORE_PREPARE, (initDataMask: string) => {
      s?.to(roomId).emit('game-prepare', initDataMask);
    });

    game.subscribe(LifeCycle.AFTER_START, () => {
      s?.to(roomId).emit('game-start');
    });

    game.subscribe(LifeCycle.BEFORE_STEP, (stepStr: string) => {
      s?.to(roomId).emit('game-step', stepStr);
    });

    game.subscribe(LifeCycle.AFTER_END, (result: string) => {
      s?.to(roomId).emit('game-over', result);
    });
  }
}