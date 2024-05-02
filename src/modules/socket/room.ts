import { Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { omit } from 'lodash';
import { Bot, Game, User } from '@/entity';
import { GameMode } from '@/modules/socket/types';
import { MakeIdGenerator } from '@/utils';
import { SocketResponse } from '@/modules/socket/message';

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

  TurnPlayer(roomId: string, userId: string) {
    const room = this.Map.get(roomId);
    if (!room) {
      console.log('Turn Failed', roomId);
      return ;
    }
    if (!room.Audience.some(player => player.User.Id === userId)) {
      console.log('Turn Failed', roomId);
      return ;
    }
    if (room.Players.length >= room.Game.PlayerCount) {
      console.log('Turn Failed', roomId);
      return ;
    }
    const participant = room.Audience.find(audience => audience.User.Id !== participant.User.Id);
    room.Players.push(participant);
    room.Audience = room.Audience.filter(audience => audience !== participant);
    this.SyncRoom(roomId);
  }

  TurnAudience(roomId: string, userId: string) {
    const room = this.Map.get(roomId);
    if (!room) {
      console.log('Turn Failed', roomId);
      return ;
    }
    if (!room.Players.some(audience => audience.User.Id === userId)) {
      console.log('Turn Failed', roomId);
      return ;
    }
    const participant = room.Players.find(player => player.User.Id === userId);
    room.Audience.push(participant);
    room.Players = room.Players.filter(player => player !== participant);
    this.SyncRoom(roomId);
  }

  SyncRoom(roomId: string) {
    const room = this.Map.get(roomId);
    if (!room) return;

    const participants = [...room.Players, ...room.Audience];
    const mapOp = (participant: Participant) => omit(participant, ['Socket']);
    participants.forEach(participant => {
      participant.Socket.emit(SocketResponse.SyncRoomResponse, {
        ...room,
        Players: room.Players.map(mapOp),
        Audience: room.Audience.map(mapOp),
      });
    });
  }

  Ready(roomId: string, userId: string) {
    const room = this.Map.get(roomId);
    if (!room) {
      console.log('The room does not exist.');
      return ;
    }
    const player = room.Players.find(player => player.User.Id === userId);
    if (!player) {
      console.log('The player does not exist.');
      return ;
    }
    player.IsReady = !player.IsReady;
    this.SyncRoom(roomId);
    if (room.Players.length !== room.Game.PlayerCount) {
      return ;
    }
    if (room.Players.some(player => !player.IsReady)) {
      return ;
    }
    // TODO: Start Game
    console.log('Start Game');
  }
}