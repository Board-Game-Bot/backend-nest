import { Game, GamePlugin, GamePluginImpl, LifeCycle } from '@soku-games/core';
import { range } from 'lodash';
import { Room } from '@/modules/socket/room';
import { BotRunService } from '@/modules/botrun/services';
import { sleep } from '@/utils';

interface Extra {
    Room: Room;
    BotRunService: BotRunService;
}

export { Extra as NetworkControlExtra };

export enum NetworkControlRequest {
  Step = 'NetworkControlStepRequest',
}

@GamePluginImpl('NetworkControl')
export class NetworkControlPlugin extends GamePlugin {
  bindGame(game: Game, extra: Extra): void | Record<string, any> {
    const { Room, BotRunService } = extra;

    Room.Players.forEach((player, index) => {
      const bot = player.Bot;
      if (bot) {
        // Bot
        let isGameOver = false;
        let isMyTurn = false;
        game.subscribe(LifeCycle.AFTER_END, () => isGameOver = true);
        game.subscribe([LifeCycle.AFTER_START, LifeCycle.AFTER_STEP], async () => {
          if (isGameOver) return ;
          if (game.data.turn !== index || !game.isAllowed()) return ;
          // Delay to perf
          await sleep(100);
          const input = `${index} ${game.toString()}`;
          const output = await BotRunService.run(bot.ContainerId, input);
          isMyTurn = true;
          setTimeout(() => {
            isMyTurn = false;
            game.step(index + output);
          });
        });
        game.subscribe([LifeCycle.INVALID_FORMAT, LifeCycle.INVALID_STEP], () => {
          if (!isMyTurn) return;
          const result = range(Room.Game.PlayerCount).map((i) => index === i ? '-5' : '+2').join(';');
          game.end(result);
          isMyTurn = false;
        });
      }
      else {
        // Head
        const socket = player.Socket;
        if (socket.listeners(NetworkControlRequest.Step).length > 0) return ;
        const listener = (step: string) => game.step(step);
        socket.on(NetworkControlRequest.Step, listener);
        game.subscribe(LifeCycle.AFTER_END, () => {
          socket.off(NetworkControlRequest.Step, listener);
        });
      }
    });
  }
}