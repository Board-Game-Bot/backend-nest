import { nanoid } from 'nanoid';
import dayjs from 'dayjs';
import { Socket } from 'socket.io';
import { GET_SOCKET_SERVER } from './constants';
import { Mode, Player } from './types';
import { ChatReq, ChatRes, MakeRoomRes, PrepareReq, PrepareRes } from './dtos';
import { EventManager } from '@/utils';

export class Room {
  static IdMap: Map<string, Room> = new Map<string, Room>();

  roomId: string;
  gameId: string;
  players: Player[];
  socketMap: Map<string, Socket> = new Map;
  game: Partial<{ initData: string, steps: string[] }> = { initData: '', steps: [] };

  em: EventManager = new EventManager();

  constructor(
    gameId: string,
    players: Player[],
    socketMap: Map<string, Socket>,
    mode: Mode,
    roomId?: string,
    callback?: () => void,
  ) {
    roomId = roomId ?? nanoid();

    Object.assign(this, { roomId, gameId, players, socketMap });
    [...socketMap.values()].forEach(socket => socket.join(roomId));

    this.emit('make-room', <MakeRoomRes>{
      roomId,
      players,
    });

    const prepareStatus: boolean[] = players.map(() => false);
    players.forEach((player, i) => {
      const mySocket = socketMap.get(player.playerId);

      // 准备
      if (mode === 'match') {
        this.em.bindEvent(mySocket, 'prepare', (body: PrepareReq) => {
          prepareStatus[i] = body.isPrepare;
          this.emit('prepare', { prepareStatus } as PrepareRes);
          if (players.every((_, i) => prepareStatus[i])) {
            callback?.();
          }
        });
      }
      // 聊天
      this.em.bindEvent(mySocket, 'chat', (body: ChatReq) => {
        mySocket.to(roomId).emit('chat', {
          ...body,
          time: dayjs().format('YYYY-MM-DD hh:mm'),
          playerId: player.playerId,
        } as ChatRes);
      });

      // 离开房间，解散
      const handleLeaveRoom = () => {
        this.emit('leave-room');
        this.disband();
      };
      // 用户主动退出游戏、用户断开连接，都要触发
      this.em.bindEvent(mySocket, 'leave-room', handleLeaveRoom);
      this.em.bindEvent(mySocket, 'disconnect', handleLeaveRoom);
    });

    if (mode !== 'match')
      setTimeout(() => {
        callback?.();
      });
  }

  join(playerId: string, socket: Socket) {
    this.socketMap.set(playerId, socket);
    socket.join(this.roomId);

    this.em.bindEvent(socket, 'disconnect', () => {
      this.socketMap.delete(playerId);
    });
  }

  emit(event: string, message?: any) {
    GET_SOCKET_SERVER()?.to(this.roomId).emit(event, message);
  }

  disband() {
    Room.IdMap.delete(this.roomId);

    this.em.disband();
  }
}