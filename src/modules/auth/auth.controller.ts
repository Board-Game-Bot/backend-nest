import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from './guard/auth.guard';
import { LoginDto, RegisterDto } from '@/modules/auth/dtos';
import { AuthService } from '@/modules/auth/auth.service';
import { Jwt } from '@/common/decorators';
import { JwtType } from '@/types';
import { UserService } from '@/modules/user/user.service';

@Controller('/api/auth')
export class AuthController {
  @Inject()
    authService: AuthService;

  @Inject()
    userService: UserService;

  @Post('/register')
  async register(@Body() dto: RegisterDto) {
    return await this.authService.register(dto);
  }

  @Post('/login')
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }

  @Get('/load')
  @UseGuards(AuthGuard)
  async load(@Jwt() jwt: JwtType) {
    return await this.userService.getProfile(jwt.id);
  }
}
