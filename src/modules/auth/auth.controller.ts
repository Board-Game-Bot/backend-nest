import { Body, Controller, Inject, Post } from '@nestjs/common';
import { LoginAccountRequest, RegisterAccountRequest } from '@/modules/auth/dtos';
import { AuthService } from '@/modules/auth/auth.service';
import { UserService } from '@/modules/user/user.service';
import { RequestOk } from '@/utils';

@Controller('/api')
export class AuthController {
  @Inject()
    authService: AuthService;

  @Inject()
    userService: UserService;

  @Post('/RegisterAccount')
  async registerAccount(@Body() request: RegisterAccountRequest) {
    return RequestOk(await this.authService.registerAccount(request));
  }

  @Post('/LoginAccount')
  async loginAccount(@Body() request: LoginAccountRequest) {
    return RequestOk(await this.authService.loginAccount(request));
  }
}
