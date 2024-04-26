import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { TapeService } from './service';
import { CreateTapeRequest, DeleteTapeRequest, GetTapeRequest, ListTapesRequest, UpdateTapeRequest } from './dtos';
import { AuthGuard } from '@/modules/auth/guard/auth.guard';
import { Jwt } from '@/common/decorators';
import { JwtType, OnlyIdResponse } from '@/types';
import { CommonResponseType, RequestOk } from '@/utils';
import { Tape } from '@/entity';
import { CommonListResponse } from '@/response';

@Controller('/api')
export class TapeController {
  @Inject()
    tapeService: TapeService;

  @UseGuards(AuthGuard)
  @Post('/CreateTape')
  async createTape(@Jwt() jwt: JwtType, @Body() request: CreateTapeRequest): CommonResponseType<OnlyIdResponse> {
    const id = await this.tapeService.createTape(jwt.Id, request);
    return RequestOk({ Id: id });
  }

  @Post('/GetTape')
  async getTape(@Body() request: GetTapeRequest): CommonResponseType<Tape> {
    return RequestOk(await this.tapeService.getTape(request.Id));
  }

  @Post('/ListTapes')
  async listTapes(@Body() request: ListTapesRequest): CommonResponseType<CommonListResponse<Tape>> {
    return RequestOk(await this.tapeService.listTapes(request));
  }

  @UseGuards(AuthGuard)
  @Post('/UpdateTape')
  async updateTape(@Jwt() jwt: JwtType, @Body() request: UpdateTapeRequest) {
    await this.tapeService.updateTape(jwt.Id, request);
    return RequestOk({});
  }

  @UseGuards(AuthGuard)
  @Post('/DeleteTape')
  async deleteTape(@Jwt() jwt: JwtType, @Body() request: DeleteTapeRequest) {
    await this.tapeService.deleteTape(jwt.Id, request);
    return RequestOk({});
  }
}