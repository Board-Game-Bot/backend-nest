import { Body, Controller, Get, Inject, Post, Query, UseGuards } from '@nestjs/common';
import { OnlyIdDto, CreateDto, DeleteDto, UpdateDto, InnerUpdateStatusDto } from './dtos';
import { BotService } from './service';
import { AuthGuard } from '@/modules/auth/guard/auth.guard';
import { Jwt } from '@/common/decorators';
import { JwtType } from '@/types';
import { InnerGuard } from '@/modules/auth/guard/inner.guard';

@Controller('/api/bot')
export class BotController {
  @Inject()
    botService: BotService;

  @Post('/create')
  @UseGuards(AuthGuard)
  async create(@Body() body: CreateDto, @Jwt() jwt: JwtType) {
    return await this.botService.create(jwt.id, body);
  }

  @Get('/get')
  @UseGuards(AuthGuard)
  async get(@Jwt() jwt: JwtType, @Query('pageIndex') pageIndex: number, @Query('pageSize') pageSize: number) {
    return await this.botService.get(jwt.id, pageIndex, pageSize);
  }

  @Get('/game')
  @UseGuards(AuthGuard)
  async game(@Jwt() jwt: JwtType, @Query('gameId') gameId: string) {
    return {
      bots: await this.botService.game(jwt.id, gameId),
    };
  }

  @Get('/code')
  @UseGuards(AuthGuard)
  async code(@Jwt() jwt: JwtType, @Query('botId') botId: string) {
    return await this.botService.code(jwt.id, botId);
  }

  @Post('/update')
  @UseGuards(AuthGuard)
  async update(@Jwt() jwt: JwtType, @Body() body: UpdateDto) {
    return await this.botService.update(jwt.id, body);
  }

  @Post('/compile')
  @UseGuards(AuthGuard)
  async compile(@Jwt() jwt: JwtType, @Body() body: OnlyIdDto) {
    return await this.botService.compile(jwt.id, body.id);
  }

  @Post('/stop')
  @UseGuards(AuthGuard)
  async stop(@Jwt() jwt: JwtType, @Body() body: OnlyIdDto) {
    return await this.botService.stop(jwt.id, body.id);
  }

  @Post('/delete')
  @UseGuards(AuthGuard)
  async delete(@Jwt() jwt: JwtType, @Body() body: DeleteDto) {
    return await this.botService.delete(jwt.id, body.botId);
  }

  @Post('/InnerUpdateStatus')
  @UseGuards(InnerGuard)
  async innerUpdateStatus(@Body() body: InnerUpdateStatusDto) {
    return await this.botService.innerUpdateStatus(body.containerId, body.status, body.message);
  }
}