import { Socket } from 'socket.io';
import { Inject, Injectable } from '@nestjs/common';
import { omit } from 'lodash';
import { buildGame, Game as SokuGame } from '@soku-games/core';
import { Bot, Game, User } from '@/entity';
import { GameMode } from '@/modules/socket/types';
import { MakeIdGenerator } from '@/utils';
import { SocketResponse } from '@/modules/socket/message';
import './plugins';
import { GameOverRateExtra, NetworkControlExtra, NetworkReadyExtra, NetworkSyncExtra } from '@/modules/socket/plugins';
import { BotRunService } from '@/modules/botrun/services';
import { SocketGateway } from '@/modules/socket/gateway';
import { RateService } from '@/modules/rate/service';

export interface Participant {
    User: User;
    Bot?: Bot;
    Socket: Socket;
    IsReady?: boolean;
}

export interface Room {
    Id: string;
    Game: Game;
    Mode: GameMode;
    Players: Participant[];
    Audience: Participant[];
    SokuGame?: SokuGame;
}

@Injectable()
export class RoomManager {
  Map = new Map<string, Room>;
  IdGenerate = MakeIdGenerator('room');

  MakeRoom(game: Game, mode: GameMode, id?: string) {
    if (!id) {
      id = this.IdGenerate();
    }
    const keys = [...this.Map.keys()];
    while (keys.includes(id)) {
      id = this.IdGenerate();
    }
    const room: Room = {
      Id: id,
      Game: game,
      Mode: mode,
      Players: [],
      Audience: [],
    };
    this.Map.set(id, room);
    return id;
  }

  JoinRoom(roomId: string, participant: Participant, isPlayer = false) {
    const room = this.Map.get(roomId);
    if (!room) {
      console.log('Join Room Failed', roomId);
      return ;
    }
    if (isPlayer) {
      room.Players.push(participant);
    }
    else {
      room.Audience.push(participant);
    }
    this.SyncRoom(roomId);
  }

  LeaveRoom(roomId: string, participant: Participant) {
    const room = this.Map.get(roomId);
    if (!room) {
      console.log('Leave Room Failed', roomId);
      return ;
    }
    const isPlayer = room.Players.some(player => player.User.Id === participant.User.Id);
    room.Players = room.Players.filter(p => p.User.Id !== participant.User.Id);
    room.Audience = room.Audience.filter(p => p.User.Id !== participant.User.Id);

    const participants = [...room.Players, ...room.Audience];
    if (isPlayer) {
      room.Mode = GameMode.Custom;
    }
    if (!participants.length) {
      this.Map.delete(roomId);
    }
    else {
      this.SyncRoom(roomId);
    }
  }

  TurnPlayer(roomId: string, participant: Participant) {
    const room = this.Map.get(roomId);
    if (!room) {
      console.log('Turn Failed 1', roomId);
      return ;
    }
    if (room.Players.length >= room.Game.PlayerCount) {
      console.log('Turn Failed 3', roomId);
      return ;
    }
    room.Players.push(participant);
    room.Audience = room.Audience.filter(audience => audience.User.Id !== participant.User.Id);
    this.SyncRoom(roomId);
  }

  TurnAudience(roomId: string, userId: string) {
    const room = this.Map.get(roomId);
    if (!room) {
      console.log('Turn Failed 1', roomId);
      return ;
    }
    const participant = room.Players.find(player => player.User.Id === userId);
    if (!participant) {
      console.log('Turn Failed 2', roomId);
      return ;
    }
    room.Audience.push(participant);
    room.Players = room.Players.filter(player => player.User.Id !== participant.User.Id);
    this.SyncRoom(roomId);
  }

  SyncRoom(roomId: string) {
    const room = this.Map.get(roomId);
    if (!room) return;

    const participants = [...room.Players, ...room.Audience];
    const mapOp = (participant: Participant) => omit(participant, ['Socket']);
    participants.forEach(participant => {
      participant.Socket.emit(SocketResponse.SyncRoomResponse, {
        ...omit(room, ['SokuGame']),
        Players: room.Players.map(mapOp),
        Audience: room.Audience.map(mapOp),
      });
    });
  }

  @Inject()
    botRunService: BotRunService;
  @Inject()
    rateService: RateService;

  Ready(roomId: string, userId: string) {
    const room = this.Map.get(roomId);
    if (!room) {
      console.log('The room does not exist.');
      return ;
    }
    const players = room.Players.filter(player => player.User.Id === userId);
    if (!players.length) {
      console.log('The player does not exist.');
      return ;
    }
    const isReady = !players[0].IsReady;
    players.forEach(player => player.IsReady = isReady);
    this.SyncRoom(roomId);
    if (room.Players.length !== room.Game.PlayerCount) {
      return ;
    }
    if (room.Players.some(player => !player.IsReady)) {
      return ;
    }
    room.SokuGame = buildGame({
      name: room.Game.Id,
      plugins: [
        `${room.Game.Id}-validator`,
        {
          name: 'NetworkReady',
          extra: <NetworkReadyExtra>{
            Room: room,
            Server: SocketGateway.Server,
          },
        },
        {
          name: 'NetworkSync',
          extra: <NetworkSyncExtra>{
            Room: room,
            Server: SocketGateway.Server,
          },
        },
        {
          name: 'NetworkControl',
          extra: <NetworkControlExtra>{
            Room: room,
            BotRunService: this.botRunService,
          },
        },
        {
          name: 'GameOverRate',
          extra: <GameOverRateExtra>{
            Room: room,
            RateService: this.rateService,
          },
        },
      ],
    });
  }
}