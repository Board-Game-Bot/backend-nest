import { Game, GamePlugin, GamePluginImpl } from '@soku-games/core';
import { Socket } from 'socket.io';

@GamePluginImpl('network-server-controller')
export class NetworkServerController extends GamePlugin {
  bindGame(game: Game, extra?: { sockets: Socket[] }): void | Record<string, any> {
    const isOk = extra?.sockets.map(() => false);
    extra?.sockets.forEach((s, i) => {
      s?.on('game-start', () => {
        isOk[i] = true;
        if (isOk.every(x => x)) {
          game.start();
        }
      });
      s?.on('game-step', (stepStr: string) => {
        game.step(stepStr);
      });
    });
  }
}