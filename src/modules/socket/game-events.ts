import { Room } from './room';

export function startGame(room: Room) {
  // TODO 开始游戏
  room.emit('start-game', {});
}

