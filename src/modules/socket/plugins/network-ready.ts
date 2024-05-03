import { Game, GamePlugin, GamePluginImpl } from '@soku-games/core';
import { Server } from 'socket.io';
import { get, uniq } from 'lodash';
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
      const totalCount = Room.Players.length + Room.Audience.length;
      if (okCount >= totalCount) {
        game.start();
      }
    };
    const participants = uniq([...Room.Players, ...Room.Audience]);
    const emitter = Server.to(Room.Id);

    participants.forEach(participant => {
      const socket = participant.Socket;
      socket.on(NetworkRequest.ReadyRequest, function handleReady() {
        tryToStartGame();
        socket.off(NetworkRequest.ReadyRequest, handleReady);
      });
    });
    emitter.emit(NetworkResponse.ReadyResponse);
  }
}