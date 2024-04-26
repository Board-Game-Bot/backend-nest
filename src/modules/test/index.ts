import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { FooRequest } from './types';
import { AuthGuard } from '@/modules/auth/guard/auth.guard';

@Controller('/api')
export class TestController {
  @Post('/TestFoo')
  async test(@Body() body: FooRequest) {

    return ;
  }

  @UseGuards(AuthGuard)
  @Post('/AuthTestFoo')
  async testAuth() {
    return;
  }

  @Post('/ThrowTestFoo')
  async throwTest() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    console.log(x);
  }
}
