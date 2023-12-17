import { Player } from '@/modules/socket/types';

export interface JoinMatchReq {
  gameId: string;
  botId?: string;
}

export interface JoinMatchRes {}

export interface LeaveMatchReq {
  gameId: string;
}

export interface LeaveMatchRes {}

export interface MakeRoomRes {
  players: Player[];
  roomId: string;
}

export interface LeaveRoomRes {}

export interface ChatReq {
  content: string;
}

export interface ChatRes {
  content: string;
  playerId: string;
  time: string;
}

export interface PrepareReq {
  isPrepare: boolean;
}

export interface PrepareRes {
  prepareStatus: boolean[];
}

export interface CreatePreRoomReq {
  gameId: string;
}

export interface JoinPreRoomReq {
  roomId: string;
  gameId: string;
}

export interface SeatPreRoomReq {
  index: number;
  botId: string;
}

export interface JoinLiveReq {
  roomId: string;
}