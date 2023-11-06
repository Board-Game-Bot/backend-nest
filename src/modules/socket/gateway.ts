import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection, OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Inject, Injectable } from '@nestjs/common';
import { JoinMatchReq, LeaveMatchReq } from './dtos';
import { tryToAddPlayer, tryToRemovePlayer } from './match-pool';
import { GET_SOCKET_SERVER, SET_SOCKET_SERVER } from './constants';
import { Client } from './clazz';

@Injectable()
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'ws',
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
    server: Server;

  @Inject()
    jwtService: JwtService;

  clientMap: Map<Socket, Client> = new Map;

  handleConnection(socket: Socket): any {
    // 单例服务器
    if (!GET_SOCKET_SERVER())
      SET_SOCKET_SERVER(this.server);

    try {
      // success
      const jwt = socket.request.headers['x-jwt'] as string;
      const { id } = this.jwtService.verify(jwt);
      this.clientMap.set(socket, new Client(socket, id));
    }
    catch {
      // failed
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket): any {
    this.clientMap.delete(socket);
  }

  /**
   * 加入匹配
   * @param body
   * @param socket
   */
  @SubscribeMessage('join-match')
  joinMatch(
    @MessageBody() body: JoinMatchReq,
    @ConnectedSocket() socket: Socket,
  ) {
    const { gameId, botId } = body;
    const client = this.clientMap.get(socket);
    const score = this.getScore(gameId, client.playerId, botId);
    const result = tryToAddPlayer(
      gameId,
      client.playerId,
      score,
      botId,
      socket,
    );

    if (result)
      return {};
  }

  /**
   * 退出匹配
   * @param body
   * @param socket
   */
  @SubscribeMessage('leave-match')
  leaveMatch(
    @MessageBody() body: LeaveMatchReq,
    @ConnectedSocket() socket: Socket,
  ) {
    const { gameId } = body;
    const client = this.clientMap.get(socket);
    const result = tryToRemovePlayer(
      gameId,
      client.playerId,
    );

    if (result)
      socket.emit('leave-match');
  }

  /**
   * 获取分数
   * @param gameId
   * @param playerId
   * @param botId
   * @todo 查找对应的分数，必须要有 gameId、playerId、botId
   * @todo 接入 Rating 表
   */
  getScore(gameId: string, playerId: string, botId: string) {
    return 1500 + Math.random() * 20 | 0;
  }
}