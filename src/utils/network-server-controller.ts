import { Game, GamePlugin, GamePluginImpl, LifeCycle } from '@soku-games/core';
import { Socket } from 'socket.io';
import { API } from '@/utils/request';
import { Bot } from '@/entity';
import { Player } from '@/modules/socket/types';

interface Extra {
  socketMap: Map<string, Socket>;
  players: Player[];
  bots: Bot[];
}

@GamePluginImpl('network-server-controller')
export class NetworkServerController extends GamePlugin {
  bindGame(game: Game, extra?: Extra): void | Record<string, any> {
    if (!extra) return ;

    const { players, bots, socketMap } = extra;
    const isOk = [...socketMap.keys()].map(() => false);
    const isBotReady = bots.map((b) => !b);
    const tryToStart = () => {
      if (isOk.every(x => x) && isBotReady.every(x => x))
        game.start();
    };

    const lock: Record<string, boolean> = {};
    players.forEach((p, i) => {
      let containerId: string;
      const b = bots[i];
      const socket = socketMap.get(p.playerId);
      socket?.on('game-start', async () => {
        isOk[i] = true;
        tryToStart();
      });
      if (b) {
        API
          .post('/create', {
            lang: b.langId,
            code: b.code,
          })
          .then(response => {
            containerId = response.data.containerId;
            return containerId;
          })
          .then(containerId => {
            return API.post('/compile', {
              containerId,
            });
          })
          .then(() => {
            isBotReady[i] = true;
            tryToStart();
          });

        let isMyTurn = false;
        game.subscribe([LifeCycle.AFTER_STEP, LifeCycle.AFTER_START], async () => {
          if (!(game.data.turn === i && game.isAllowed())) return;
          API
            .post('/run', {
              containerId,
              input: `${i} ${game.toString()}`,
            })
            .then(response => {
              const output = response.data?.output ?? '';
              isMyTurn = true;
              setTimeout(() => {
                game.step(output);
                isMyTurn = false;
              });
            });
        });
        game.subscribe([LifeCycle.INVALID_FORMAT, LifeCycle.INVALID_STEP], () => {
          if (!isMyTurn) return ;
          game.end(players.map((_, _i) => _i === i).map(x => x ? '-5' : '+2').join(';'));
          isMyTurn = false;
        });
        game.subscribe(LifeCycle.AFTER_END, () => {
          API.post('/stop', {
            containerId,
          });
        });
      }
      else {
        if (lock[p.playerId]) return;
        socket?.on('game-step', (stepStr: string) => {
          game.step(stepStr);
        });
        lock[p.playerId] = true;
      }
    });
  }
}