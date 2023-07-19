import { Body, Controller, Inject, Post } from '@nestjs/common';
import { LoginDto, RegisterDto } from '@/modules/auth/dtos';
import { AuthService } from '@/modules/auth/auth.service';

@Controller('/api/auth')
export class AuthController {
  @Inject()
  authService: AuthService;

  @Post('/register')
  async register(@Body() dto: RegisterDto) {
    return await this.authService.register(dto);
  }

  @Post('/login')
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }
}
