import { nanoid } from 'nanoid';
import { Socket } from 'socket.io';
import { Client } from './clazz';
import { GET_SOCKET_SERVER } from './constants';
import { SeatPreRoomReq } from './dtos';
import { MatchPoolService } from './match-pool.service';

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

  constructor(client: Client, gameId: string, playerCount: number) {
    PreRoom.IdMap.set(this.id, this);
    this.players = Array.from({ length: playerCount }, () => ({ playerId: '', botId: '' }));

    this.gameId = gameId;
    this.ownerId = client.playerId;
    this.socketMap.set(client.playerId, client.socket);

    const { socket } = client;
    socket.join(this.id);
    socket.emit('create-preroom', { roomId: this.id });
    this.syncPreRoom();
    socket.on('disconnect', () => this.disband());
    socket.on(this.wrap('leave'), () => this.disband());
    socket.on(this.wrap('start'), () => this.startGame());
    this.bindEvent(client);
  }

  wrap(event: string) {
    return `preroom-${this.id}(${event})`;
  }

  emit(event: string, params?: any) {
    GET_SOCKET_SERVER().to(this.id).emit(event, params);
  }

  join(client: Client) {
    const { socket } = client;
    socket.emit('join-preroom', { roomId: this.id });
    this.socketMap.set(client.playerId, client.socket);
    socket.join(this.id);
    this.syncPreRoom();

    this.bindEvent(client);
  }

  bindEvent(client: Client) {
    const { socket, playerId } = client;
    socket.on('disconnect', () => this.leave(playerId));
    socket.on(this.wrap('leave'), () => this.leave(playerId));
    socket.on(this.wrap('seat'), ({ botId, index }: SeatPreRoomReq) => this.seat(playerId, botId, index));
    socket.on(this.wrap('unseat'), ({ index }) => this.unseat(index));
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
    socket.emit(this.wrap('leave'));

    this.syncPreRoom();
  }

  syncPreRoom() {
    this.emit(this.wrap('sync'), {
      roomId: this.id,
      clients: [...this.socketMap.keys()],
      players: this.players,
      ownerId: this.ownerId,
    });
  }

  startGame() {
    if (this.players.find(({ playerId }) => !playerId)) return ;

    MatchPoolService.ROOM_SERVICE.makeRoom(this.gameId, this.players, this.socketMap, 'custom');
  }

  disband() {
    PreRoom.IdMap.delete(this.id);

    this.emit(this.wrap('disband'));

    [...this.socketMap.values()].forEach((socket) => socket.leave(this.id));
  }
}