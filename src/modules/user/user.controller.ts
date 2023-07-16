import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { UserService } from '@/modules/user/user.service';

@Controller('api/user')
export class UserController {
  @Inject()
  userService: UserService;

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return id;
  }

  // DELETE: 测试专用
  @Post('register')
  async register(@Body() body: { name: string }) {
    return this.userService.register(body);
  }
}
