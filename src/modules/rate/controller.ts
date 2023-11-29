import { Controller, Get, Inject, Query } from '@nestjs/common';
import { RateService } from './service';

@Controller('/api/rate')
export class RateController {
  @Inject()
    rateService: RateService;

  @Get('/get')
  async get(
    @Query('gameId') gameId: string,
    @Query('pageIndex') pageIndex: number,
    @Query('pageSize') pageSize: number,
  ) {
    return await this.rateService.get(gameId, pageIndex, pageSize);
  }
}