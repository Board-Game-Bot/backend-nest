import { nanoid } from 'nanoid';
import { Player } from './clazz';
import { GET_SOCKET_SERVER } from './constants';
import { Candidate } from './types';
import { MakeRoomRes } from '@/modules/socket/dtos';

/**
 * 房间，建立游戏用，也可以用来直播，直播的一个小群体的单位
 */
export class Room {
  roomId: string;
  gameId: string;
  players: Player[];

  constructor(gameId: string, candidates: Candidate[]) {
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
      })),
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