import { Game, GamePlugin, GamePluginImpl, NewGenerator } from '@soku-games/core';
import { Server } from 'socket.io';
import { uniq } from 'lodash';
import { Room } from '@/modules/socket/room';

interface Extra {
    Room: Room;
    Server: Server;
}

export { Extra as NetworkReadyExtra };

export enum NetworkRequest {
  ReadyRequest = 'NetworkReadyRequest',
}

export enum NetworkResponse {
  ReadyResponse = 'NetworkReadyResponse',
}

@GamePluginImpl('NetworkReady')
export class NetworkReadyPlugin extends GamePlugin {
  bindGame(game: Game, extra: Extra): void | Record<string, any> {
    const { Room, Server } = extra;

    let okCount = 0;
    const tryToStartGame = () => {
      okCount += 1;
      const sockets = uniq(Room.Players.concat(Room.Audience).map(participant => participant.Socket));
      const totalCount = sockets.length;
      if (okCount >= totalCount) {
        const initData = NewGenerator(Room.Game.Id).generate();
        game.prepare(initData);
        game.start();
      }
    };
    const sockets = uniq([...Room.Players, ...Room.Audience].map(participant => participant.Socket));
    const emitter = Server.to(Room.Id);

    sockets.forEach(socket => {
      socket.on(NetworkRequest.ReadyRequest, function handleReady() {
        tryToStartGame();
        socket.off(NetworkRequest.ReadyRequest, handleReady);
      });
    });
    emitter.emit(NetworkResponse.ReadyResponse);
  }
}