import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/entity/user';
import { UpdateUserRequest } from '@/request';

@Injectable()
export class UserService {
  @InjectRepository(User)
    userDao: Repository<User>;

  async getUser(id: string): Promise<User> {
    return await this.userDao.findOneByOrFail({ Id: id });
  }

  async updateUser(id: string, data: UpdateUserRequest) {
    return await this.userDao.update(id, data);
  }
}
