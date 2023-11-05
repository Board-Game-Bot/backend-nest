import { Socket } from 'socket.io';

/**
 * 代表刚加入 ws 连接的用户玩家（无游戏，无房间）
 */
export class Client {
  socket: Socket;
  playerId: string;

  constructor(socket: Socket, playerId: string) {
    Object.assign(this, { socket, playerId });
  }
}