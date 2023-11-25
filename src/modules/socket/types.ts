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