import { Body, Controller, Get, Inject, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@/modules/auth/guard/auth.guard';
import { CreateBotDto, DeleteBotDto, UpdateBotDto } from '@/modules/bot/dtos';
import { Jwt } from '@/common/decorators';
import { JwtType } from '@/types';
import { BotService } from '@/modules/bot/service';

@Controller('/api/bot')
export class BotController {
  @Inject()
    botService: BotService;

  @Post('/create')
  @UseGuards(AuthGuard)
  async createBot(@Body() body: CreateBotDto, @Jwt() jwt: JwtType) {
    return await this.botService.createBot(jwt.id, body);
  }

  @Get('/request')
  @UseGuards(AuthGuard)
  async requestBot(@Jwt() jwt: JwtType) {
    return await this.botService.requestBot(jwt.id);
  }

  @Get('/see')
  async seeBot(@Query('userId') userId: string) {
    return await this.botService.seeBot(userId);
  }

  @Post('/update')
  @UseGuards(AuthGuard)
  async updateBot(@Body() body: UpdateBotDto, @Jwt() jwt: JwtType) {
    return await this.botService.updateBot(jwt.id, body);
  }

  @Post('/delete')
  @UseGuards(AuthGuard)
  async deleteBot(@Body() body: DeleteBotDto, @Jwt() jwt: JwtType) {
    return await this.botService.deleteBot(jwt.id, body);
  }
}