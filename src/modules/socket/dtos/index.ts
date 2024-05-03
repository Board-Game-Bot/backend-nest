export interface JoinMatchRequest {
  GameId: string;
  BotId?: string;
}

export interface JoinRoomRequest {
  IsPlayer?: boolean;
  RoomId: string;
  BotId?: string;
}

export interface MakeRoomRequest {
  GameId: string;
  RoomId?: string;
}

export interface ReadyRequest {
  RoomId: string;
}

export interface OnlyRoomIdRequest {
  RoomId: string;
}