import { Socket } from 'socket.io';

/**
 * 正在匹配池中进行匹配的玩家
 */
export interface Candidate {
  score: number;
  botId: string;
  playerId: string;
  wait: number;
  socket: Socket;
}

/**
 * 匹配算法
 */
export type MatchAlgo = (candidates: Candidate[]) => boolean;

export type Mode =
  | 'match'
  | 'custom'

export class Player {
  socket: Socket;
  playerId: string;
  botId: string;
  score: number;

  constructor(
    socket: Socket,
    playerId: string,
    botId: string,
    score: number,
  ) {
    Object.assign(this, {
      socket,
      playerId,
      botId,
      score,
    } as Player);
  }
}