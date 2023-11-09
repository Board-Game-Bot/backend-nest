import { Controller, Get, Query } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { makeSuccess, sleep } from '@/utils';

@Controller('/api/record')
export class RecordController {
  @Get('')
  async getByGameId(
    @Query('id') id: string,
    @Query('index') index: number,
    @Query('size') size: number,
  ) {
    // TODO: implement me
    await sleep(1000);
    const records = Array.from({ length: size })
      .fill(0)
      .map(() => ({
        id: faker.string.uuid(),
        time: faker.date.anytime(),
        result: faker.lorem.sentence(1),
        users: Array(2)
          .fill(0)
          .map(() => ({
            id: faker.string.uuid(),
            name: faker.animal.cat(),
            avatar: faker.image.avatar(),
          })),
      }));

    return makeSuccess({
      records,
    });
  }
}
