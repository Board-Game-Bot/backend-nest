import { nanoid } from 'nanoid';
import dayjs from 'dayjs';
import { Candidate, tryToAddPlayer } from './match-pool';
import { Player } from './clazz';
import { ChatReq, ChatRes, LeaveRoomRes, MakeRoomRes, PrepareReq, PrepareRes } from './dtos';
import { GET_SOCKET_SERVER } from './constants';
import { startGame } from './game-events';

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

    // 游戏准备部分
    const prepareStatus: boolean[] = Array.from({ length: players.length }, () => false);

    players.forEach((player, i) => {
      const mySocket = player.socket;
      // 视作每个玩家
      mySocket.on('prepare', (body: PrepareReq) => {
        prepareStatus[i] = body.isPrepare;
        this.emit('prepare', { prepareStatus } as PrepareRes);
        if (players.every((_, i) => prepareStatus[i])) {
          startGame(this);
          this.allPlayerOffEvent('prepare');
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
        this.disbandBy(player);
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
  emit(event: string, message: any) {
    GET_SOCKET_SERVER()?.to(this.roomId).emit(event, message);
  }

  allPlayerOffEvent(event: string) {
    this.players.forEach(player => player.socket.removeAllListeners(event));
  }

  /**
   * 某人退出房间，解散
   * @param _player
   */
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