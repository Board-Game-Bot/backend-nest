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
import { CreatePreRoomReq, JoinMatchReq, JoinPreRoomReq } from './dtos';
import { GET_SOCKET_SERVER, SET_SOCKET_SERVER } from './constants';
import { Client } from './clazz';
import { MatchPoolService } from './match-pool.service';
import { PreRoom } from './PreRoom';
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

  handleConnection(socket: Socket): any {
    // 单例服务器
    if (!GET_SOCKET_SERVER())
      SET_SOCKET_SERVER(this.server);

    try {
      // success
      const jwt = socket.request.headers['x-jwt'] as string;
      const { id } = this.jwtService.verify(jwt);

      new Client(socket, id);
    }
    catch {
      // failed
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket): any {
    const client = Client.IdMap.get(socket);
    client.disconnect();
    this.matchPoolService.tryToRemovePlayer(client.playerId);
  }

  @SubscribeMessage('join-match')
  async joinMatch(
    @MessageBody() body: JoinMatchReq,
    @ConnectedSocket() socket: Socket,
  ) {
    const { gameId, botId } = body;
    const client = Client.IdMap.get(socket);
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

  @SubscribeMessage('create-preroom')
  createPreRoom(
    @MessageBody() body: CreatePreRoomReq,
    @ConnectedSocket() socket: Socket,
  ) {
    const client = Client.IdMap.get(socket);

    // TODO: 改为先查询再传参数
    new PreRoom(client, body.gameId, 2);
  }

  @SubscribeMessage('join-preroom')
  joinPreRoom(
    @MessageBody() body: JoinPreRoomReq,
    @ConnectedSocket() socket: Socket,
  ) {
    const client = Client.IdMap.get(socket);
    const { roomId, gameId } = body;

    const preRoom = PreRoom.IdMap.get(roomId);
    if (preRoom?.gameId !== gameId) return ;

    preRoom.join(client);
  }

  async getScore(gameId: string, playerId: string, botId: string) {
    return await this.rateService.findRate(playerId, gameId, botId);
  }
}