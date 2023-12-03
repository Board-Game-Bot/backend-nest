import { Socket } from 'socket.io';

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