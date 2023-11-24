import { Inject, Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import { GameService } from './game.service';
import { ChatReq, ChatRes, PrepareReq, PrepareRes } from './dtos';
import { Room } from './room';
import { GET_SOCKET_SERVER } from './constants';
import { Candidate } from './types';

@Injectable()
export class RoomService {
  @Inject()
    gameService: GameService;

  makeRoom(gameId: string, candidates: Candidate[]) {
    const room = new Room(gameId, candidates);

    const prepareStatus: boolean[] = room.players.map(() => false);
    room.players.forEach((player, i) => {
      const mySocket = player.socket;

      mySocket.on('prepare', (body: PrepareReq) => {
        prepareStatus[i] = body.isPrepare;
        room.emit('prepare', { prepareStatus } as PrepareRes);
        if (room.players.every((_, i) => prepareStatus[i])) {
          this.gameService.startGame(room, GET_SOCKET_SERVER());
          room.allPlayerOffEvent('prepare');
        }
      });

      // 聊天
      mySocket.on('chat', (body: ChatReq) => {
        mySocket.to(room.roomId).emit('chat', {
          ...body,
          time: dayjs().format('YYYY-MM-DD hh:mm'),
          playerId: player.playerId,
        } as ChatRes);
      });

      // 离开房间，解散
      const handleLeaveRoom = () => {
        room.emit('leave-room');
        mySocket.removeAllListeners('leave-room');
        mySocket.removeAllListeners('chat');
      };
      // 用户主动退出游戏、用户断开连接，都要触发
      mySocket.on('leave-room', handleLeaveRoom);
      mySocket.on('disconnect', handleLeaveRoom);
    });
  }
}