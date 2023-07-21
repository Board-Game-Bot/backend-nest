import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginDto, RegisterDto } from '@/modules/auth/dtos';
import { Auth, User } from '@/entity';
import { makeFailure, makeSuccess } from '@/utils';
import { encrypt, verify } from '@/modules/auth/auth.utils';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  @InjectRepository(Auth)
  authDao: Repository<Auth>;
  @InjectRepository(User)
  userDao: Repository<User>;
  @Inject()
  jwtService: JwtService;

  async register(dto: RegisterDto) {
    const { account, passwd, remember } = dto;

    // 验证账户是否已存在
    const existAuth = await this.authDao.findOneBy({
      account,
    });

    if (existAuth) {
      return makeFailure('账户已存在，请更换', {});
    }
    // 创建账户
    // 密码哈希
    const _auth = await this.authDao.create({
      ...dto,
      passwd: await encrypt(passwd),
    });
    const auth = await this.authDao.save(_auth);

    // 创建用户
    const _user = await this.userDao.create({
      id: auth.id,
      name: auth.account,
      avatar: 'https://sdfsdf.dev/100x100.png',
    });
    const user = await this.userDao.save(_user);

    // 生成JWT
    const jwt = this.signIn(user.id, remember === 'on');

    // 返回信息
    return makeSuccess({
      user,
      jwt,
    });
  }

  async login(dto: LoginDto) {
    const { account, passwd, remember } = dto;
    // 查找是否存在这个账户
    const existAuth = await this.authDao.findOneBy({
      account,
    });

    if (!existAuth) {
      return makeFailure('此用户不存在，检查账户是否正确', {});
    }

    // 验证密码是否一致
    const verifyResult = await verify(existAuth.passwd, passwd);

    if (!verifyResult) {
      return makeFailure('密码错误，请重新输入', {});
    }

    // 是否存在此用户
    const user = await this.userDao.findOneBy({
      id: existAuth.id,
    });

    if (!user) {
      return makeFailure('此用户不存在，可能已注销', {});
    }

    // 成功，返回信息以及 JWT
    const jwt = this.signIn(user.id, remember === 'on');

    return makeSuccess({
      user,
      jwt,
    });
  }

  signIn(id: string, remember: boolean) {
    return this.jwtService.sign(
      { id },
      { expiresIn: remember ? '14d' : '30s' },
    );
  }
}
