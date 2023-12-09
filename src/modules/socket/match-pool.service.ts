import { Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { pick } from 'lodash';
import { Candidate, MatchAlgo } from './types';
import { RoomService } from './room.service';
import { GameService } from './game.service';

const MATCH_POOL: Record<string, Record<string, Candidate>> = {};
const MATCH_ALGO_MAP: Record<number, MatchAlgo> = {};
const COMMON_MATCH_ALGO = (candidates: Candidate[]) => {
  const diff = Math.abs(candidates[0].score - candidates[1].score);
  const acceptDiff = Math.min(candidates[0].wait * 10, candidates[1].wait * 10);

  return diff <= acceptDiff;
};

const PLAYER_COUNT_MAP: Record<number, number> = {};
const COMMON_PLAYER_COUNT = 2;

function DISPLAY_MATCH_POOL() {
  const pool = Object.entries(MATCH_POOL)
    .reduce(
      (pool, playerMapEntry) => {
        const [game, playerMap] = playerMapEntry;
        pool[game] = Object.keys(playerMap);
        return pool;
      },
      {} as Record<string, string[]>,
    );

  console.log('MATCH_POOL', pool);
}

@Injectable()
export class MatchPoolService {
  static ROOM_SERVICE: RoomService;
  static GAME_SERVICE: GameService;

  constructor(
    roomService: RoomService,
    gameService: GameService,
  ) {
    MatchPoolService.ROOM_SERVICE = roomService;
    MatchPoolService.GAME_SERVICE = gameService;
  }

  tryToAddPlayer(
    gameId: string,
    playerId: string,
    score: number,
    botId: string,
    socket: Socket,
  ): boolean {
    if (!MATCH_POOL[gameId])
      MATCH_POOL[gameId] = {};
    const pool = MATCH_POOL[gameId];

    if (pool[playerId])
      return false;

    pool[playerId] = {
      score,
      botId,
      playerId,
      wait: 0,
      socket,
    };

    DISPLAY_MATCH_POOL();

    socket.on('disconnect', () => this.tryToRemovePlayer(playerId));
    socket.on('leave-match', () => this.tryToRemovePlayer(playerId));

    return true;
  }

  tryToRemovePlayer(playerId: string): boolean {
    for (const pool of Object.values(MATCH_POOL)) {
      if (pool[playerId]) {
        const candidate = pool[playerId];
        delete pool[playerId];
        DISPLAY_MATCH_POOL();
        candidate.socket.emit('leave-match');
        return true;
      }
    }
    return false;
  }

  static TIMER: NodeJS.Timer;

  static INIT_MATCH_POOL() {
    MatchPoolService.TIMER = setInterval(() => {
      oneCycle();
    }, 2000);

    // 一个轮回
    const oneCycle = () => {
      let flag = false;
      Object.entries(MATCH_POOL).forEach(
        ([gameId, candidateMap]) => {
          // 一类游戏
          const playerCount = PLAYER_COUNT_MAP[gameId] ?? COMMON_PLAYER_COUNT;
          const matchAlgo = MATCH_ALGO_MAP[gameId] ?? COMMON_MATCH_ALGO;
          const candidates = Object.entries(candidateMap).sort(
            (i, j) => i[1].score - j[1].score,
          );
          const N = candidates.length;

          const newCandidateMap: Record<string, Candidate> = {};
          for (let i = N; i > 0; --i)
            if (i >= playerCount) {
              const candidateSlice = candidates
                .slice(i - playerCount, i)
                .map(x => x[1]);

              if (matchAlgo(candidateSlice)){
                const players = candidateSlice.map(x => pick(x, ['playerId', 'botId', 'score']));
                const socketMap = new Map(
                  candidateSlice.map(x => [x.playerId, x.socket]),
                );
                Math.random() <= .5 && players.reverse();
                this.ROOM_SERVICE.makeRoom(gameId, players, socketMap, 'match');
                i -= playerCount;
                flag = true;
              }
              else {
                const candidate = candidates[i - 1];
                newCandidateMap[candidate[0]] = candidate[1];
                candidate[1].wait++;
              }
            }
            else {
              const candidate = candidates[i - 1];
              newCandidateMap[candidate[0]] = candidate[1];
              candidate[1].wait++;
            }

          if (Object.keys(newCandidateMap).length > 0)
            MATCH_POOL[gameId] = newCandidateMap;
          else
            delete MATCH_POOL[gameId];
        },
      );
      if (flag)
        DISPLAY_MATCH_POOL();
    };
  }

  static STOP_TIMER() {
    clearInterval(MatchPoolService.TIMER);
  }
}

MatchPoolService.INIT_MATCH_POOL();