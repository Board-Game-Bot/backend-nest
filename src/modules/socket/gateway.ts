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
import { GET_SOCKET_SERVER, SET_SOCKET_SERVER } from './constants';
import { Client } from './clazz';
import { MatchPoolService } from './match-pool.service';
import { RateService } from '@/modules/rate/service';

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

  @Inject()
    rateService: RateService;

  @Inject()
    matchPoolService: MatchPoolService;

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
    const client = this.clientMap.get(socket);
    this.clientMap.delete(socket);
    this.matchPoolService.tryToRemovePlayer(client.playerId);
  }

  @SubscribeMessage('join-match')
  async joinMatch(
    @MessageBody() body: JoinMatchReq,
    @ConnectedSocket() socket: Socket,
  ) {
    const { gameId, botId } = body;
    const client = this.clientMap.get(socket);
    const score = await this.getScore(gameId, client.playerId, botId);
    const result = this.matchPoolService.tryToAddPlayer(
      gameId,
      client.playerId,
      score.score,
      botId,
      socket,
    );

    result && socket.emit('join-match') ;
  }

  @SubscribeMessage('leave-match')
  leaveMatch(
    @MessageBody() body: LeaveMatchReq,
    @ConnectedSocket() socket: Socket,
  ) {
    const client = this.clientMap.get(socket);
    const result = this.matchPoolService.tryToRemovePlayer(client.playerId);

    if (result)
      socket.emit('leave-match');
  }

  async getScore(gameId: string, playerId: string, botId: string) {
    return await this.rateService.findRate(playerId, gameId, botId);
  }
}