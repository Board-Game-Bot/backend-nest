import { Game, GamePlugin, GamePluginImpl } from '@soku-games/core';
import { Socket } from 'socket.io';

@GamePluginImpl('network-server-controller')
export class NetworkServerController extends GamePlugin {
  bindGame(game: Game, extra?: { sockets: Socket[] }): void | Record<string, any> {
    extra?.sockets.forEach(s => {
      s?.on('game-step', (stepStr: string) => {
        game.step(stepStr);
      });
    });
  }
}