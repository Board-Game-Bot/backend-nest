import { Injectable } from '@nestjs/common';
import { User } from '@/entity/user';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  @InjectRepository(User)
  userDao: Repository<User>;

  async register(info: { name: string }) {
    const _user = await this.userDao.create({
      ...info,
      avatar: 'http://sdfsdf.dev/100x100.png',
    });

    return await this.userDao.save(_user);
  }
}
