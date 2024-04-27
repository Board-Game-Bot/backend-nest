import { buildGame, LifeCycle, NewGenerator } from '@soku-games/core';
import { Server } from 'socket.io';
import { Inject, Injectable } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import { Room } from './Room';
import { Mode, PreRoomEvent } from './types';
import { RateService } from '@/modules/rate/service';
import { BotService } from '@/modules/bot/service';
import { API_INSTANCE_KEY } from '@/modules/botrun/constants';
import { makeRoomWrapper } from '@/modules/socket/utils';

@Injectable()
export class OnlineGameService {
  @Inject()
    rateService: RateService;
  @Inject()
    botService: BotService;
  @Inject(API_INSTANCE_KEY)
    apiInstance: AxiosInstance;

  async startGame(room: Room, server: Server, mode: Mode, preRoomId?: string) {
    const event = preRoomId ? makeRoomWrapper(preRoomId)(PreRoomEvent.StartGame) : 'start-game';
    room.emit(event);
    const { gameId, roomId } = room;

    const bots = await Promise.all(
      room.players.map(async ({ botId }) => {
        if (botId) {
          return await this.botService.getBot(botId);
        }
        return null;
      }),
    );

    const game = buildGame({
      name: gameId,
      plugins: [
        `${gameId}-validator`,
        {
          name: 'network-server-controller',
          extra: {
            API: this.apiInstance,
            players: room.players,
            socketMap: room.socketMap,
            bots,
          },
        },
        {
          name: 'network-sync-renderer',
          extra: {
            server,
            roomId,
          },
        },
      ],
    });
    const initData = NewGenerator(gameId).generate();
    game.prepare(initData);
    room.game.initData = initData;
    game.subscribe(LifeCycle.BEFORE_STEP, (stepStr: string) => room.game.steps.push(stepStr));

    if (mode === 'match')
      game.subscribe(LifeCycle.AFTER_END, (result: string) => {
        '+x;-y';
        const scores = result.split(';');
        scores.forEach(async (score, i) => {
          const player = room.players[i];
          const newScore = player.score + 3 * parseInt(score);
          try {
            await this.rateService.updateRate({
              UserId: player.playerId,
              GameId: room.gameId,
              BotId: player.botId ?? '',
              Score: newScore,
            });
          }
          catch (e) {
            console.log('error', e);
          }
        });
      });

    game.subscribe(LifeCycle.AFTER_START, () => {
      Room.IdMap.set(room.roomId, room);
    });
    game.subscribe(LifeCycle.AFTER_END, () => room.disband());
  }
}