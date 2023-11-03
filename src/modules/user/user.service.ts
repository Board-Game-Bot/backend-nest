import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateDto, UpdateVo } from './dtos';
import { User } from '@/entity/user';
import { makeFailure } from '@/utils';

@Injectable()
export class UserService {
  @InjectRepository(User)
    userDao: Repository<User>;

  async getProfile(id: string): Promise<User> {
    try {
      return await this.userDao.findOneByOrFail({
        id,
      });
    }
    catch (e) {
      makeFailure('查无此人');
    }
  }

  async updateProfile(id: string, data: UpdateDto): Promise<UpdateVo> {
    try {
      return await this.userDao.update(id, {
        ...data,
        id,
      });
    }
    catch (e) {
      console.log(e);
      makeFailure('修改失败，请重试');
    }
  }
}
