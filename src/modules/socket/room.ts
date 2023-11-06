import { nanoid } from 'nanoid';
import dayjs from 'dayjs';
import { Candidate, tryToAddPlayer } from './match-pool';
import { Player } from './clazz';
import { ChatReq, ChatRes, LeaveRoomRes, MakeRoomRes } from './dtos';
import { GET_SOCKET_SERVER } from './constants';

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

    // 加入房间
    players.forEach(player => player.socket.join(roomId));

    // 通知房间内所有人房间里有哪些人
    const message: MakeRoomRes = {
      roomId,
      players: players.map(player => ({
        id: player.playerId,
        score: player.score,
      })),
    };

    this.emit('make-room', message);

    players.forEach((player) => {
      const onChat = (body: ChatReq) => {
        player.socket.to(roomId).emit('chat', {
          ...body,
          time: dayjs().format('YYYY-MM-DD hh:mm'),
          playerId: player.playerId,
        } as ChatRes);
      };
      player.socket.on('chat', onChat);

      const onLeaveRoom = () => {
        this.disbandBy(player);
        player.socket.off('leave-room', onLeaveRoom);
        player.socket.off('chat', onChat);
      };
      // 用户主动退出游戏、用户断开连接，都要触发
      player.socket.on('leave-room', onLeaveRoom);
      player.socket.on('disconnect', onLeaveRoom);
    });
  }

  emit(event: string, message: any) {
    GET_SOCKET_SERVER()?.to(this.roomId).emit(event, message);
  }

  disbandBy(_player: Player) {
    this.players.forEach(player => {
      const isMe = player === _player;
      player.socket.emit('leave-room', { isMe } as LeaveRoomRes);

      if (!isMe) {
        const { playerId, score, botId, socket } = player;
        const result = tryToAddPlayer(
          this.gameId,
          playerId,
          score,
          botId,
          socket,
        );
        if (!result)
          player.socket.emit('leave-match');
      }
    });
  }
}

// TODO 创建新的房间
export function makeRoom(gameId: string, candidates: Candidate[]) {
  const room = new Room(gameId, candidates);
}