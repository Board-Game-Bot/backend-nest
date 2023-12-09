import { nanoid } from 'nanoid';
import dayjs from 'dayjs';
import { Socket } from 'socket.io';
import { GET_SOCKET_SERVER } from './constants';
import { Mode, Player } from './types';
import { ChatReq, ChatRes, MakeRoomRes, PrepareReq, PrepareRes } from './dtos';

export class Room {
  roomId: string;
  gameId: string;
  players: Player[];
  socketMap: Map<string, Socket> = new Map;

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
        mySocket.on('prepare', (body: PrepareReq) => {
          prepareStatus[i] = body.isPrepare;
          this.emit('prepare', { prepareStatus } as PrepareRes);
          if (players.every((_, i) => prepareStatus[i])) {
            callback?.();
          }
        });
      }
      // 聊天
      mySocket.on('chat', (body: ChatReq) => {
        mySocket.to(roomId).emit('chat', {
          ...body,
          time: dayjs().format('YYYY-MM-DD hh:mm'),
          playerId: player.playerId,
        } as ChatRes);
      });

      // 离开房间，解散
      const handleLeaveRoom = () => {
        this.emit('leave-room');
        mySocket.removeAllListeners('leave-room');
        mySocket.removeAllListeners('chat');
      };
      // 用户主动退出游戏、用户断开连接，都要触发
      mySocket.on('leave-room', handleLeaveRoom);
      mySocket.on('disconnect', handleLeaveRoom);
    });

    if (mode !== 'match')
      setTimeout(() => {
        callback?.();
      });
  }

  emit(event: string, message?: any) {
    GET_SOCKET_SERVER()?.to(this.roomId).emit(event, message);
  }

  allPlayerOffEvent(event: string) {
    this.players.forEach(player => this.socketMap.get(player.playerId).removeAllListeners(event));
  }
}