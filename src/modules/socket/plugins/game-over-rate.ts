import { Game, GamePlugin, GamePluginImpl, LifeCycle } from '@soku-games/core';
import { cloneDeep, omit, range } from 'lodash';
import { RateService } from '@/modules/rate/service';
import { Room } from '@/modules/socket/room';
import { GameMode } from '@/modules/socket/types';

interface Extra {
  Room: Room;
  RateService: RateService;
}

export { Extra as GameOverRateExtra };

@GamePluginImpl('GameOverRate')
export class GameOverRatePlugin extends GamePlugin {
  bindGame(game: Game, extra: Extra): void | Record<string, any> {
    const { Room, RateService } = extra;
    const copiedPlayers = cloneDeep(Room.Players.map(player => omit(player, ['Socket'])));
    if (Room.Mode !== GameMode.Match) return ;
    game.subscribe(LifeCycle.AFTER_END, (result: string) => {
      const results = result.split(';');
      results.forEach(async (str, index) => {
        const sign = str[0];
        const numStr = str.slice(1);
        const num = +numStr * (sign === '-' ? -1 : 1);
        const player = copiedPlayers[index];
        const rate = await RateService.getOrCreateRate({
          GameId: Room.Game.Id,
          UserId: player.User.Id,
          BotId: player.Bot?.Id ?? '',
        });
        const newScore = rate.Score += num;
        RateService.updateRate({
          ...rate,
          Score: newScore,
        });
      });
    });

    Room.Players.forEach((player, index) => {
      if (Room.Mode !== GameMode.Match) return;

      const socket = player.Socket;
      const listener = () => {
        const results = range(Room.Game.PlayerCount).map(x => x === index ? '-5' : '+0');
        game.end(results.join(';'));
        socket.off('disconnect', listener);
      };
      socket.on('disconnect', listener);
      game.subscribe(LifeCycle.AFTER_END, () => socket.off('disconnect', listener));
    });
  }
}