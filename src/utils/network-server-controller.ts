import { Game, GamePlugin, GamePluginImpl, LifeCycle } from '@soku-games/core';
import { Socket } from 'socket.io';
import { AxiosInstance } from 'axios';
import { Bot } from '@/entity';
import { Player } from '@/modules/socket/types';
import { sleep } from '@/utils';

interface Extra {
  socketMap: Map<string, Socket>;
  players: Player[];
  bots: Bot[];
  API: AxiosInstance;
}

@GamePluginImpl('network-server-controller')
export class NetworkServerController extends GamePlugin {
  bindGame(game: Game, extra?: Extra): void | Record<string, any> {
    if (!extra) return ;

    const { players, bots, socketMap, API } = extra;
    const isOk = [...socketMap.keys()].map(() => false);
    const tryToStart = () => {
      if (isOk.every(x => x)) game.start();
    };

    const lock: Record<string, boolean> = {};
    // frontend prepare
    [...socketMap.values()].forEach((socket, i) => {
      const listener = async () => {
        isOk[i] = true;
        tryToStart();
      };
      socket?.on('game-start', listener);
      game.subscribe([LifeCycle.AFTER_END], () => {
        socket?.off('game-start', listener);
      });
    });

    bots.forEach((b, i) => {
      if (!b) return ;
      const containerId = b.containerId;
      let isMyTurn = false;

      // step if bot exists
      let isGameOver = false;
      game.subscribe([LifeCycle.AFTER_END], () => isGameOver = true);
      game.subscribe([LifeCycle.AFTER_STEP, LifeCycle.AFTER_START], async () => {
        if (isGameOver) return ;
        if (!(game.data.turn === i && game.isAllowed())) return;
        const inputStr = `${i} ${game.toString()}`;
        await sleep(100);
        const response = await API.post('/run', {
          containerId,
          input: inputStr,
        });

        const output = response.data?.output ?? '';
        isMyTurn = true;
        setTimeout(() => {
          game.step(i + output);
          isMyTurn = false;
        });
      });

      // game end if invalid format step
      game.subscribe([LifeCycle.INVALID_FORMAT, LifeCycle.INVALID_STEP], () => {
        if (!isMyTurn) return ;
        game.end(players.map((_, _i) => _i === i).map(x => x ? '-5' : '+2').join(';'));
        isMyTurn = false;
      });
    });

    // step from client
    players.forEach(({ playerId, botId }) => {
      if (botId) return ;

      if (lock[playerId]) return;
      const socket = socketMap.get(playerId);
      const listener = (stepStr: string) => {
        game.step(stepStr);
      };
      socket?.on('game-step', listener);
      game.subscribe([LifeCycle.AFTER_END], () => {
        socket.off('game-step', listener);
      });
      lock[playerId] = true;
    });
  }
}