import { chunk, flatten, shuffle, uniqBy } from 'lodash';
import { Rate } from '@/entity/rate';

export class MatchPools {
  Map = new Map<string, Rate[]>();
  AddUser(gameId: string, _rate: Rate) {
    const pool = this.Map.get(gameId) ?? [];
    if (pool.some(rate => rate.UserId === _rate.UserId)) {
      return false;
    }
    this.Map.set(gameId, [...pool, _rate]);
    return true;
  }

  DelUser(gameId: string, _rate: Rate) {
    const pool = this.Map.get(gameId) ?? [];
    if (pool.every(rate => rate.UserId !== _rate.UserId)) {
      return false;
    }
    this.Map.set(gameId, pool.filter(rate => rate.UserId !== _rate.UserId));
    return true;
  }

  OneLoop (gameId: string) {
    const pool = this.Map.get(gameId) ?? [];
    const shuffledPool = shuffle(pool);
    const chunkedPool = chunk(shuffledPool, 2);
    chunkedPool.forEach(rates => {
      if (rates.length < 2) {
        return;
      }
      console.log('Make a match', rates);
    });
    this.Map.set(gameId, flatten(chunkedPool.filter(rates => rates.length < 2)));
  }

  constructor() {
    setInterval(() => {
      [...this.Map.keys()].forEach((gameId) => {
        this.OneLoop(gameId);
      });
    }, 2000);
  }
}
