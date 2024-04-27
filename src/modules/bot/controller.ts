import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { BotService } from './service';
import {
  InnerUpdateStatusRequest,
  CreateBotRequest,
  ListBotsRequest, ListBotsResponse, GetBotRequest, UpdateBotRequest, DeleteBotRequest, StartBotRequest, StopBotRequest,
} from '@/request';
import { AuthGuard } from '@/modules/auth/guard/auth.guard';
import { Jwt } from '@/common/decorators';
import { EmptyObject, JwtType, OnlyIdResponse } from '@/types';
import { InnerGuard } from '@/modules/auth/guard/inner.guard';
import { CommonResponseType, RequestOk } from '@/utils';
import { Bot } from '@/entity';

@Controller('/api')
export class BotController {
  @Inject()
    botService: BotService;

  @UseGuards(AuthGuard)
  @Post('/CreateBot')
  async createBot(@Jwt() jwt: JwtType, @Body() request: CreateBotRequest): CommonResponseType<OnlyIdResponse> {
    const { Id } = jwt;
    const id = await this.botService.createBot(Id, request);
    return RequestOk({ Id: id });
  }

  @UseGuards(AuthGuard)
  @Post('/ListBots')
  async listBots(@Body() request: ListBotsRequest): CommonResponseType<ListBotsResponse> {
    return RequestOk(await this.botService.listBots(request));
  }

  @UseGuards(AuthGuard)
  @Post('/GetBot')
  async getBot(@Body() request: GetBotRequest): CommonResponseType<Bot> {
    return RequestOk(await this.botService.getBot(request.Id));
  }

  @UseGuards(AuthGuard)
  @Post('/UpdateBot')
  async updateBot(@Jwt() jwt: JwtType, @Body() request: UpdateBotRequest): CommonResponseType<EmptyObject> {
    await this.botService.updateBot(jwt.Id, request);
    return RequestOk({});
  }

  @UseGuards(AuthGuard)
  @Post('/DeleteBot')
  async deleteBot(@Jwt() jwt: JwtType, @Body() request: DeleteBotRequest): CommonResponseType<EmptyObject> {
    await this.botService.deleteBot(jwt.Id, request.Id);
    return RequestOk({});
  }

  @UseGuards(AuthGuard)
  @Post('/StartBot')
  async startBot(@Jwt() jwt: JwtType, @Body() request: StartBotRequest): CommonResponseType<EmptyObject> {
    await this.botService.startBot(jwt.Id, request.Id);
    return RequestOk({});
  }

  @UseGuards(AuthGuard)
  @Post('/StopBot')
  async stopBot(@Jwt() jwt: JwtType, @Body() request: StopBotRequest): CommonResponseType<EmptyObject> {
    await this.botService.stopBot(jwt.Id, request.Id);
    return RequestOk({});
  }

  @UseGuards(InnerGuard)
  @Post('/InnerUpdateBotStatus')
  async innerUpdateBotStatus(@Body() body: InnerUpdateStatusRequest) {
    return await this.botService.innerUpdateBotStatus(body.ContainerId, body.Status, body.Message);
  }
}