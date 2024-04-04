import { nanoid } from 'nanoid';
import { Socket } from 'socket.io';
import { Client } from './clazz';
import { GET_SOCKET_SERVER } from './constants';
import { SeatPreRoomReq } from './dtos';
import { MatchPoolService } from './match-pool.service';
import { PreRoomEvent } from '@/modules/socket/types';
import { makeRoomWrapper } from '@/modules/socket/utils';
import { EventManager } from '@/utils';

interface Player {
  playerId: string;
  botId: string;
}

export class PreRoom {
  static IdMap: Map<string, PreRoom> = new Map;

  socketMap: Map<string, Socket> = new Map;
  players: Player[];
  id: string = nanoid();
  gameId: string;
  ownerId: string;

  em: EventManager = new EventManager();

  constructor(client: Client, gameId: string, playerCount: number) {
    PreRoom.IdMap.set(this.id, this);
    this.players = Array.from({ length: playerCount }, () => ({ playerId: '', botId: '' }));

    this.gameId = gameId;
    this.ownerId = client.playerId;
    this.socketMap.set(client.playerId, client.socket);

    const { socket } = client;
    socket.join(this.id);
    socket.emit(PreRoomEvent.CreatePreRoom, {
      room: {
        roomId: this.id,
        clients: [...this.socketMap.keys()],
        players: this.players,
        ownerId: this.ownerId,
      },
    });
    this.syncPreRoom();
    this.em.bindEvent(socket, 'disconnect', this.disband.bind(this));
    this.em.bindEvent(socket, this.wrap(PreRoomEvent.LeavePreRoom), this.disband.bind(this));
    this.em.bindEvent(socket, this.wrap(PreRoomEvent.StartGame), () => this.startGame());
    this.bindBasicEvent(client);
  }

  wrap(event: PreRoomEvent) {
    return makeRoomWrapper(this.id)(event);
  }

  emit(event: string, params?: any) {
    GET_SOCKET_SERVER().to(this.id).emit(event, params);
  }

  join(client: Client) {
    const { socket } = client;
    this.socketMap.set(client.playerId, client.socket);
    socket.join(this.id);

    socket.emit(PreRoomEvent.JoinPreRoom, {
      room: {
        roomId: this.id,
        clients: [...this.socketMap.keys()],
        players: this.players,
        ownerId: this.ownerId,
      },
    });
    this.syncPreRoom();

    this.bindBasicEvent(client);
  }

  bindBasicEvent(client: Client) {
    const { socket, playerId } = client;
    this.em.bindEvent(socket, 'disconnect', this.leave.bind(this, playerId));
    this.em.bindEvent(socket, this.wrap(PreRoomEvent.LeavePreRoom), () => this.leave(playerId));
    this.em.bindEvent(socket, this.wrap(PreRoomEvent.SeatPreRoom), ({ botId, index }: SeatPreRoomReq) => this.seat(playerId, botId, index));
    this.em.bindEvent(socket, this.wrap(PreRoomEvent.UnseatPreRoom), ({ index }) => this.unseat(index));
  }

  seat(playerId: string, botId: string, index: number) {
    if (this.players[index].playerId) return ;
    this.players[index] = { playerId, botId };

    this.syncPreRoom();
  }

  unseat(index: number) {
    this.players[index] = { playerId: '', botId: '' };

    this.syncPreRoom();
  }

  leave(playerId: string) {
    const socket = this.socketMap.get(playerId);
    this.socketMap.delete(playerId);
    this.players = this.players.map(player => player.playerId === playerId ? { playerId: '', botId: '' } : player);

    if (!socket) return ;
    socket.leave(this.id);
    socket.emit(this.wrap(PreRoomEvent.LeavePreRoom));

    this.syncPreRoom();
  }

  syncPreRoom() {
    this.emit(this.wrap(PreRoomEvent.SyncPreRoom), {
      roomId: this.id,
      clients: [...this.socketMap.keys()],
      players: this.players,
      ownerId: this.ownerId,
    });
  }

  startGame() {
    if (this.players.find(({ playerId }) => !playerId)) return ;

    MatchPoolService.ROOM_SERVICE.makeRoom(this.gameId, this.players, this.socketMap, 'custom', this.id);
  }

  disband() {
    PreRoom.IdMap.delete(this.id);

    this.emit(this.wrap(PreRoomEvent.DisbandPreRoom));

    [...this.socketMap.values()].forEach((socket) => socket.leave(this.id));

  }
}