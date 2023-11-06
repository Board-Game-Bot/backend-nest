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
  players: {
    id: string;
    score: number;
  }[];
  roomId: string;
}

export interface LeaveRoomRes {
  isMe: boolean;
}

export interface ChatReq {
  content: string;
}

export interface ChatRes {
  content: string;
  playerId: string;
  time: string;
}