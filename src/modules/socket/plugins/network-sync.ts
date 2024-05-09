import { Game, GamePlugin, GamePluginImpl, LifeCycle } from '@soku-games/core';
import { Server } from 'socket.io';
import { Room } from '@/modules/socket/room';

interface Extra {
    Room: Room;
    Server: Server;
}

export { Extra as NetworkSyncExtra };

const NeedProxyLifeCycles = [LifeCycle.BEFORE_PREPARE, LifeCycle.AFTER_START, LifeCycle.BEFORE_STEP, LifeCycle.AFTER_END];

@GamePluginImpl('NetworkSync')
export class NetworkSyncPlugin extends GamePlugin {
  bindGame(game: Game, extra: Extra): void | Record<string, any> {
    const { Room, Server } = extra;
    const emitter = Server.to(Room.Id);
    NeedProxyLifeCycles.forEach(event => {
      game.subscribe(event, (...args) => {
        emitter.emit(event, ...args);
      });
    });
  }
}