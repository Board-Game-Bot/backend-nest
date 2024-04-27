import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { RateService } from './service';
import {
  CreateRateRequest,
  GetRateRequest,
  ListRatesRequest,
  ListRatesResponse,
  OnlyRateId,
  UpdateRateRequest,
} from '@/request';
import { InnerGuard } from '@/modules/auth/guard/inner.guard';
import { CommonResponseType, RequestOk } from '@/utils';
import { Rate } from '@/entity/rate';
import { EmptyObject } from '@/types';

@Controller('/api')
export class RateController {
  @Inject()
    rateService: RateService;

  @UseGuards(InnerGuard)
  @Post('/CreateRate')
  async createRate(@Body() request: CreateRateRequest): CommonResponseType<OnlyRateId> {
    const id = await this.rateService.createRate(request);
    return RequestOk(id);
  }

  @Post('/GetRate')
  async getRate(@Body() request: GetRateRequest): CommonResponseType<Rate> {
    return RequestOk(await this.rateService.getRate(request));
  }

  @Post('/ListRates')
  async listRates(@Body() request: ListRatesRequest): CommonResponseType<ListRatesResponse> {
    return RequestOk(await this.rateService.listRates(request));
  }


  @Post('/UpdateRate')
  async updateRate(@Body() request: UpdateRateRequest): CommonResponseType<EmptyObject> {
    await this.rateService.updateRate(request);
    return RequestOk({});
  }
}