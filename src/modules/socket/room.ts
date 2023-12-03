import { nanoid } from 'nanoid';
import dayjs from 'dayjs';
import { Player } from './clazz';
import { GET_SOCKET_SERVER } from './constants';
import { Candidate, Mode } from './types';
import { ChatReq, ChatRes, MakeRoomRes, PrepareReq, PrepareRes } from './dtos';

/**
 * 房间，建立游戏用，也可以用来直播，直播的一个小群体的单位
 */
export class Room {
  roomId: string;
  gameId: string;
  players: Player[];

  /**
   * TODO callback 语义有点差
   * @param gameId
   * @param candidates
   * @param mode
   * @param callback
   */

  constructor(gameId: string, candidates: Candidate[], mode: Mode, callback?: () => void) {
    // 创建房间
    const roomId = nanoid();
    const players = candidates.map(candidate => {
      delete candidate.wait;
      return { ...candidate };
    });
    Object.assign(this, { roomId, gameId, players });

    players.forEach(player => player.socket.join(roomId));

    this.emit('make-room', <MakeRoomRes>{
      roomId,
      players: players.map(player => ({
        id: player.playerId,
        score: player.score,
        botId: player.botId,
      })),
    });

    const prepareStatus: boolean[] = players.map(() => false);

    players.forEach((player, i) => {
      const mySocket = player.socket;

      mySocket.on('prepare', (body: PrepareReq) => {
        prepareStatus[i] = body.isPrepare;
        this.emit('prepare', { prepareStatus } as PrepareRes);
        if (players.every((_, i) => prepareStatus[i])) {
          callback?.();
        }
      });

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
  }

  /**
   * 房间广播
   * @param event
   * @param message
   */
  emit(event: string, message?: any) {
    GET_SOCKET_SERVER()?.to(this.roomId).emit(event, message);
  }

  allPlayerOffEvent(event: string) {
    this.players.forEach(player => player.socket.removeAllListeners(event));
  }
}