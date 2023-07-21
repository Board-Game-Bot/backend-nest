import { Injectable } from '@nestjs/common';
import { User } from '@/entity/user';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { makeFailure, makeSuccess } from '@/utils';

@Injectable()
export class UserService {
  @InjectRepository(User)
  userDao: Repository<User>;

  async getProfile(id: string) {
    const user = await this.userDao.findOneBy({
      id,
    });

    if (!user) {
      return makeFailure('查无此人', {});
    }

    return makeSuccess({
      user,
    });
  }
}
