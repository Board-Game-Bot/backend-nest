import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Inject, Injectable } from '@nestjs/common';
import {
  JoinMatchRequest,
  JoinRoomRequest,
  MakeRoomRequest,
  ReadyRequest,
} from './dtos';
import { Participant, RoomManager } from './room';
import { GameMode } from './types';
import { addSocket, IdMap, removeSocket } from './socket-map';
import { SocketRequest, SocketResponse } from './message';
import { fall } from './fall';
import { RateService } from '@/modules/rate/service';
import { BotService } from '@/modules/bot/service';
import { GameService } from '@/modules/game/game.service';
import { BotStatus } from '@/types';
import { MatchPools } from '@/modules/socket/match';
import { UserService } from '@/modules/user/user.service';

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
    gameService: GameService;
  @Inject()
    userService: UserService;

  @Inject()
    room: RoomManager;

  @Inject()
    match: MatchPools;

  async handleConnection(socket: Socket) {
    try {
      // Basic Connection
      const headers = socket.request.headers;
      const jwt = headers['x-jwt'] as string;
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
    const { GameId, BotId = '' } = fall(body);
    const UserId = IdMap.get(socket);
    // validate game and bot
    const message = await this.checkBotId(UserId, BotId, GameId);
    if (message) {
      socket.emit(SocketResponse.JoinMatchErrorResponse, message);
      return ;
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

  @SubscribeMessage(SocketRequest.JoinRoomRequest)
  async joinRoom(
    @MessageBody() body: JoinRoomRequest,
    @ConnectedSocket() socket: Socket,
  ) {
    const { RoomId, BotId = '', IsPlayer = false } = fall(body);
    const UserId = IdMap.get(socket);

    const room = this.room.Map.get(RoomId);
    if (!room) {
      socket.emit(SocketResponse.JoinRoomErrorResponse, 'The room does not exist.');
      return;
    }
    const { Game: { Id: GameId } } = room;
    const message = await this.checkBotId(UserId, BotId, GameId);
    if (message) {
      socket.emit(SocketResponse.JoinRoomErrorResponse, message);
      return ;
    }
    const participant: Participant = {
      User: await this.userService.getUser(UserId),
      Socket: socket,
    };
    if (BotId) {
      participant.Bot = await this.botService.getBot(BotId);
    }

    const roomManager = this.room;
    roomManager.JoinRoom(RoomId, participant, IsPlayer);
    socket.on('disconnect', function handleLeave() {
      roomManager.LeaveRoom(RoomId, participant);
      socket.off('disconnect', handleLeave);
    });
  }

  @SubscribeMessage(SocketRequest.MakeRoomRequest)
  async makeRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: MakeRoomRequest,
  ) {
    const { RoomId, GameId } = fall(body);
    const game = this.match.Games.find(game => game.Id === GameId);
    if (!game) {
      socket.emit(SocketResponse.MakeRoomErrorResponse, 'The game does not exists.');
      return ;
    }

    const id = this.room.MakeRoom(game, GameMode.Custom, RoomId);
    socket.emit(SocketResponse.MakeRoomResponse, id);
  }

  @SubscribeMessage(SocketRequest.ReadyRequest)
  async ready(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: ReadyRequest,
  ) {
    const { RoomId } = fall(body);
    const UserId = IdMap.get(socket);
    this.room.Ready(RoomId, UserId);
  }

  async checkBotId(UserId: string, BotId: string, GameId: string): Promise<string> {
    if (BotId) {
      if (!await this.botService.isPermitted(UserId, BotId)) {
        return 'The Bot does not exist.';
      }
      const bot = await this.botService.getBot(BotId);
      if (bot.Status !== BotStatus.Working) {
        return 'The Bot is not working.';
      }
      if (bot.GameId !== GameId) {
        return 'The Bot game is not supported.';
      }
    }
    return '';
  }
}