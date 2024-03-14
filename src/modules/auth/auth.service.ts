import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

import { encrypt, verify } from './utils';
import { LoginDto, LoginVo, RegisterDto, RegisterVo } from './dtos';
import { Auth, User } from '@/entity';
import { makeFailure } from '@/utils';

@Injectable()
export class AuthService {
  @InjectRepository(Auth)
    authDao: Repository<Auth>;
  @InjectRepository(User)
    userDao: Repository<User>;
  @Inject()
    jwtService: JwtService;

  async register(dto: RegisterDto): Promise<RegisterVo> {
    const { id, passwd, remember } = dto;

    // 验证账户是否已存在
    const existAuth = await this.authDao.findOneBy({
      id,
    });

    if (existAuth)
      makeFailure('账户已存在，请更换');

    // 创建账户
    // 密码哈希
    await this.authDao.save({
      ...dto,
      id,
      passwd: await encrypt(passwd),
    });

    // 创建用户
    const user = await this.userDao.save({
      id,
      name: id,
      avatar: 'https://sdfsdf.dev/100x100.png',
    });

    // 生成JWT
    const jwt = this.signIn(user.id, remember === 'on');

    // 返回信息
    return {
      user,
      jwt,
    };
  }

  async login(dto: LoginDto): Promise<LoginVo> {
    const { id, passwd, remember } = dto;
    // 查找是否存在这个账户
    const existAuth = await this.authDao.findOneBy({ id });

    if (!existAuth)
      makeFailure('此用户不存在，检查账户是否正确');

    // 验证密码是否一致
    const verifyResult = await verify(existAuth.passwd, passwd);

    if (!verifyResult)
      makeFailure('密码错误，请重新输入');

    // 是否存在此用户
    const user = await this.userDao.findOneBy({ id: existAuth.id });

    if (!user)
      makeFailure('此用户不存在，可能已注销');

    // 成功，返回信息以及 JWT
    const jwt = this.signIn(user.id, remember === 'on');

    return {
      user,
      jwt,
    };
  }

  async isAdmin(auth: Auth) {
    return auth.id === 'Andrew';
  }

  signIn(id: string, remember: boolean) {
    return this.jwtService.sign({ id }, { expiresIn: remember ? '14d' : '1d' });
  }
}
