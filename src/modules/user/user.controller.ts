import {
  Body,
  Controller,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guard/auth.guard';
import { UserService } from './user.service';

import { Jwt } from '@/common/decorators';
import { JwtType } from '@/types';
import { RequestOk } from '@/utils';
import { UpdateUserRequest } from '@/request';

@Controller('/api')
export class UserController {
  @Inject()
    userService: UserService;

  @UseGuards(AuthGuard)
  @Post('/GetUser')
  async getUser(@Jwt() jwt: JwtType) {
    const { Id } = jwt;
    return RequestOk(await this.userService.getUser(Id));
  }

  @UseGuards(AuthGuard)
  @Post('/UpdateUser')
  async updateUser(@Jwt() jwt: JwtType, @Body() request: UpdateUserRequest) {
    return RequestOk(this.userService.updateUser(jwt.Id, request));
  }
}
