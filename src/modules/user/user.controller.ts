import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guard/auth.guard';
import { UserService } from './user.service';
import { UpdateDto } from './dtos';
import { Jwt } from '@/common/decorators';
import { JwtType } from '@/types';

@Controller('/api/user')
export class UserController {
  @Inject()
    userService: UserService;

  @Get('/profile/:id')
  async getProfile(@Param('id') id) {
    return await this.userService.getProfile(id);
  }

  @UseGuards(AuthGuard)
  @Post('/update')
  async updateProfile(@Jwt() jwt: JwtType, @Body() dto: UpdateDto) {
    return await this.userService.updateProfile(jwt.id, dto);
  }
}
