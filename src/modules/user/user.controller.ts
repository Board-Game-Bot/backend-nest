import {
  Controller,
  Get,
  Inject,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { UserService } from '@/modules/user/user.service';
import { AuthGuard } from '@/modules/auth/guard/auth.guard';

@Controller('/api/user')
export class UserController {
  @Inject()
  userService: UserService;

  @UseGuards(AuthGuard)
  @Get('/profile')
  async getProfile(@Request() req) {
    return await this.userService.getProfile(req.user.id);
  }

  @Get('/profile/:id')
  async getProfileById(@Param('id') id: string) {
    return await this.userService.getProfile(id);
  }
}
