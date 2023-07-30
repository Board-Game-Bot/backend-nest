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
    try {
      const user = await this.userDao.findOneByOrFail({
        id,
      });

      return makeSuccess({
        user,
      });
    } catch (e) {
      return makeFailure('查无此人', {});
    }
  }
}
