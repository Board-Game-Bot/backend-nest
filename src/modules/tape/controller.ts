import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { TapeService } from './service';
import { AuthGuard } from '@/modules/auth/guard/auth.guard';
import { Jwt } from '@/common/decorators';
import { JwtType } from '@/types';

@Controller('/api/tape')
export class TapeController {
  @Inject()
    tapeService: TapeService;

  @UseGuards(AuthGuard)
  @Get('/my')
  async requestMyTape(@Jwt() jwt: JwtType) {
    return await this.tapeService.requestMyTape(jwt.id, {});
  }
}