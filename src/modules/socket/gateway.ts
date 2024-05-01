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
import { CreatePreRoomReq, JoinLiveReq, JoinMatchRequest, JoinPreRoomReq } from './dtos';
import { Client } from './clazz';
import { MatchPoolService } from './match-pool.service';
import { Room } from './Room';
import { CustomModeService } from './custom-mode.service';
import { PreRoomEvent } from './types';
import { addSocket, IdMap, removeSocket } from './socket-map';
import { SocketRequest, SocketResponse } from './message';
import { RateService } from '@/modules/rate/service';
import { BotService } from '@/modules/bot/service';
import { GameService } from '@/modules/game/game.service';
import { BotStatus } from '@/types';
import { MatchPools } from '@/modules/socket/match';

@Injectable()
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'WebSocket',
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
    server: Server;
  @Inject()
    jwtService: JwtService;
  @Inject()
    rateService: RateService;
  @Inject()
    botService: BotService;
  @Inject()
    matchPoolService: MatchPoolService;
  @Inject()
    gameService: GameService;

  match: MatchPools = new MatchPools();

  handleConnection(socket: Socket): any {
    try {
      const jwt = socket.request.headers['x-jwt'] as string;
      const { Id } = this.jwtService.verify(jwt);
      addSocket(Id, socket);
    }
    catch {
      // failed
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket): any {
    removeSocket(socket);
  }

  @SubscribeMessage(SocketRequest.JoinMatchRequest)
  async joinMatch(
    @MessageBody() body: JoinMatchRequest,
    @ConnectedSocket() socket: Socket,
  ) {
    const { GameId, BotId = '' } = body;
    const UserId = IdMap.get(socket);
    // validate game and bot
    if (BotId) {
      if (!await this.botService.isPermitted(UserId, BotId)) {
        socket.emit(SocketResponse.JoinMatchErrorResponse, 'The Bot does not exist.');
        return;
      }
      const bot = await this.botService.getBot(BotId);
      if (bot.Status !== BotStatus.Working) {
        socket.emit(SocketResponse.JoinMatchErrorResponse, 'The Bot is not working.');
        return;
      }
      if (bot.GameId !== GameId) {
        socket.emit(SocketResponse.JoinMatchErrorResponse, 'The Bot game is not supported.');
        return ;
      }
    }
    if (!await this.gameService.getGame(GameId)) {
      socket.emit(SocketResponse.JoinMatchErrorResponse, 'The Game does not exist.');
      return;
    }
    // Join Match
    const match = this.match;
    const rate = await this.rateService.getOrCreateRate({ UserId, GameId, BotId });

    // Should Leave Events
    const addOk = match.AddUser(GameId, rate);
    if (!addOk) {
      return ;
    }
    const events = ['disconnect', SocketRequest.LeaveMatchRequest];
    const handler = () => {
      match.DelUser(GameId, rate);
      events.forEach(event => socket.off(event, handler));
    };
    events.forEach(event => {
      socket.on(event, handler);
    });
  }

  // 自定义模式
  @Inject()
    customModeService: CustomModeService;
  @SubscribeMessage(PreRoomEvent.CreatePreRoom)
  createPreRoom(
    @MessageBody() body: CreatePreRoomReq,
    @ConnectedSocket() socket: Socket,
  ) {
    this.customModeService.create(socket, body.gameId);
  }

  @SubscribeMessage(PreRoomEvent.JoinPreRoom)
  joinPreRoom(
    @MessageBody() body: JoinPreRoomReq,
    @ConnectedSocket() socket: Socket,
  ) {
    this.customModeService.join(socket, body.roomId, body.gameId);
  }

  @SubscribeMessage('join-live')
  joinLive(
    @MessageBody() body: JoinLiveReq,
    @ConnectedSocket() socket: Socket,
  ) {
    const { roomId } = body;
    const room = Room.IdMap.get(roomId);
    if (!room) return ;

    socket.emit('load-sync', {
      room: {
        roomId,
        players: room.players,
        gameId: room.gameId,
      },
      ...room.game,
    });

    const playerId = Client.IdMap.get(socket).playerId;
    room.join(playerId, socket);
  }
}