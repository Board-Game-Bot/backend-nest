import { Socket } from 'socket.io';

/**
 * 代表刚加入 ws 连接的用户玩家（无游戏，无房间）
 */
export class Client {
  static IdMap: Map<Socket, Client> = new Map;

  socket: Socket;
  playerId: string;

  constructor(socket: Socket, playerId: string) {
    Client.IdMap.set(socket, this);
    Object.assign(this, { socket, playerId });
  }

  disconnect() {
    Client.IdMap.delete(this.socket);
    this.socket.disconnect();
  }
}