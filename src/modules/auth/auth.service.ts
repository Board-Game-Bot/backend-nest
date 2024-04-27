import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

import { encrypt, verify } from './utils';
import { Auth, User } from '@/entity';
import { RequestFail } from '@/utils';
import { LoginAccountRequest, LoginAccountResponse, RegisterAccountRequest, RegisterAccountResponse } from '@/request';

@Injectable()
export class AuthService {
  @InjectRepository(Auth)
    authDao: Repository<Auth>;
  @InjectRepository(User)
    userDao: Repository<User>;
  @Inject()
    jwtService: JwtService;

  async registerAccount(dto: RegisterAccountRequest): Promise<RegisterAccountResponse> {
    const { Id, Password } = dto;
    // 创建账户
    // 密码哈希
    await this.authDao.save({
      ...dto,
      Password: await encrypt(Password),
    });

    // 创建用户
    await this.userDao.save({
      Id,
      Name: Id,
      Avatar: 'https://sdfsdf.dev/100x100.png',
    });

    // 生成JWT
    const jwt = this.signIn(Id, true);

    // 返回信息
    return { Jwt: jwt };
  }

  async loginAccount(dto: LoginAccountRequest): Promise<LoginAccountResponse> {
    const { Id, Password } = dto;
    // 查找是否存在这个账户
    const existAuth = await this.authDao.findOneBy({ Id });

    // 验证密码是否一致
    const verifyResult = await verify(existAuth.Password, Password);

    if (!verifyResult)
      RequestFail('密码错误，请重新输入');

    // 是否存在此用户
    const user = await this.userDao.findOneBy({ Id });

    if (!user)
      RequestFail('此用户不存在');

    // 成功，返回信息以及 JWT
    const jwt = this.signIn(Id, true);

    return {
      Jwt: jwt,
    };
  }

  async isAdmin(auth: Auth) {
    return auth.Id === 'Andrew';
  }

  signIn(id: string, remember: boolean) {
    return this.jwtService.sign({ Id: id }, { expiresIn: remember ? '14d' : '1d' });
  }
}
