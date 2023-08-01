import { Controller, Get, Param } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { makeSuccess } from '@/utils';

@Controller('/api/rank')
export class RankController {
  @Get('/:id')
  async getByGameId(@Param('id') id: string) {
    // TODO: implement me
    return makeSuccess({
      ranks: Array(10)
        .fill(0)
        .map(() => ({
          id: faker.string.uuid(),
          name: faker.animal.dog(),
          score: faker.number.int({ min: 1000, max: 5000 }),
        })),
    });
  }
}
