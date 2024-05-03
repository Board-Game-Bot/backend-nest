import { Game, GamePlugin, GamePluginImpl, LifeCycle } from '@soku-games/core';
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
    if (Room.Mode !== GameMode.Match) return ;
    game.subscribe(LifeCycle.AFTER_END, (result: string) => {
      const results = result.split(';');
      results.forEach(async (str, index) => {
        const sign = str[0];
        const numStr = str.slice(1);
        const num = +numStr * (sign === '-' ? -1 : 1);
        const player = Room.Players[index];
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
  }
}