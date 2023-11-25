import { Body, Controller, Get, Inject, Post, Query, UseGuards } from '@nestjs/common';
import { TapeService } from './service';
import { DeleteDto, UploadDto, UploadVo } from './dtos';
import { AuthGuard } from '@/modules/auth/guard/auth.guard';
import { Jwt } from '@/common/decorators';
import { JwtType } from '@/types';

@Controller('/api/tape')
export class TapeController {
  @Inject()
    tapeService: TapeService;

  @UseGuards(AuthGuard)
  @Get('/get')
  async get(
    @Jwt() jwt: JwtType,
    @Query('gameId') gameId: string,
    @Query('pageIndex') pageIndex: number,
    @Query('pageSize') pageSize: number,
  ) {
    return await this.tapeService.get(jwt.id, gameId, pageIndex, pageSize);
  }

  @UseGuards(AuthGuard)
  @Post('/upload')
  async upload(@Jwt() jwt: JwtType, @Body() body: UploadDto) {
    return await this.tapeService.upload(jwt.id, body);
  }

  @UseGuards(AuthGuard)
  @Get('/json')
  async json(@Jwt() jwt: JwtType, @Query('tapeId') tapeId: string) {
    return await this.tapeService.json(jwt.id, tapeId);
  }

  @UseGuards(AuthGuard)
  @Post('/delete')
  async delete(@Jwt() jwt: JwtType, @Body() dto: DeleteDto) {
    return await this.tapeService.delete(jwt.id, dto.tapeId);
  }
}