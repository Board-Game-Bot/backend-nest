import { Socket } from 'socket.io';
import { makeRoom } from './room';

/**
 * 正在匹配池中进行匹配的玩家
 */
export interface Candidate {
  score: number;
  botId: string;
  playerId: string;
  wait: number;
  socket: Socket;
}

// 单例，一个全局匹配池
// 参数意义从左到右依次为：游戏id、玩家id
const MATCH_POOL: Record<string, Record<string, Candidate>> = {};

/**
 * 尝试把玩家加入到匹配池中，成功了就返回 true
 * @param gameId
 * @param playerId
 * @param score
 * @param botId
 * @param socket
 */
export function tryToAddPlayer(
  gameId: string,
  playerId: string,
  score: number,
  botId: string,
  socket: Socket,
): boolean {
  if (!MATCH_POOL[gameId])
    MATCH_POOL[gameId] = {};
  const pool = MATCH_POOL[gameId];

  if (pool[playerId])
    return false;

  pool[playerId] = {
    score,
    botId,
    playerId,
    wait: 0,
    socket,
  };

  displayMatchPool();

  return true;
}

/**
 * 尝试把玩家从匹配池中拿走，成功了返回 true
 * @param gameId
 * @param playerId
 */
export function tryToRemovePlayer(
  gameId: string,
  playerId: string,
): boolean {
  if (!MATCH_POOL[gameId])
    return false;
  const pool = MATCH_POOL[gameId];

  delete pool[playerId];

  displayMatchPool();

  return true;
}

// 匹配算法类型
type MatchAlgo = (candidates: Candidate[]) => boolean;

/**
 * 用来维护不同游戏的不同匹配算法
 */
const MATCH_ALGO_MAP: Record<number, MatchAlgo> = {};
const COMMON_MATCH_ALGO = (candidates: Candidate[]) => {
  const diff = Math.abs(candidates[0].score - candidates[1].score);
  const acceptDiff = Math.min(candidates[0].wait * 10, candidates[1].wait * 10);

  return diff <= acceptDiff;
};

/**
 * 用来维护不同游戏的不同人数
 */
const PLAYER_COUNT_MAP: Record<number, number> = {};
const COMMON_PLAYER_COUNT = 2;

/**
 * 初始化，运行匹配池
 * @fixme 可能不是一个好的计时器，后续可能会使用其他的方案？
 */
let TIMER: NodeJS.Timer;
function initMatchPool() {
  TIMER = setInterval(() => {
    oneCycle();
  }, 2000);

  // 一个轮回
  function oneCycle(){
    let flag = false;
    Object.entries(MATCH_POOL).forEach(
      ([gameId, candidateMap]) => {
        // 一类游戏
        const playerCount = PLAYER_COUNT_MAP[gameId] ?? COMMON_PLAYER_COUNT;
        const matchAlgo = MATCH_ALGO_MAP[gameId] ?? COMMON_MATCH_ALGO;
        const candidates = Object.entries(candidateMap).sort(
          (i, j) => i[1].score - j[1].score,
        );
        const N = candidates.length;

        const newCandidateMap: Record<string, Candidate> = {};
        for (let i = N; i > 0; --i)
          // 一群人
          if (i >= playerCount) {
            const candidateSlice = candidates.slice(i - playerCount, i).map(x => x[1]);
            if (matchAlgo(candidateSlice)){
              makeRoom(gameId, candidateSlice);
              i -= playerCount;
              flag = true;
            }
            else {
              const candidate = candidates[i - 1];
              newCandidateMap[candidate[0]] = candidate[1];
              candidate[1].wait++;
            }
          }
          else {
            const candidate = candidates[i - 1];
            newCandidateMap[candidate[0]] = candidate[1];
            candidate[1].wait++;
          }

        if (Object.keys(newCandidateMap).length > 0)
          MATCH_POOL[gameId] = newCandidateMap;
        else
          delete MATCH_POOL[gameId];
      },
    );
    if (flag)
      displayMatchPool();
  }
}

/**
 * 显示匹配池
 */
function displayMatchPool() {
  const pool = Object.entries(MATCH_POOL)
    .reduce(
      (pool, playerMapEntry) => {
        const [game, playerMap] = playerMapEntry;
        pool[game] = Object.keys(playerMap);
        return pool;
      },
      {} as Record<string, string[]>,
    );

  console.log('MATCH_POOL', pool);
}

/**
 * 停止匹配池运作
 */
export function stopTimer() {
  clearInterval(TIMER);
}

initMatchPool();