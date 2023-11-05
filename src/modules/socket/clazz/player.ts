import { Socket } from 'socket.io';

/**
 * 玩家，匹配成功并且在 room 里面的
 */
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