import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { IdExistValidator, IdValidator } from './id.validator';
import { Auth, User } from '@/entity';
import { UserService } from '@/modules/user/user.service';

@Module({
  imports: [TypeOrmModule.forFeature([Auth, User])],
  controllers: [AuthController],
  providers: [AuthService, UserService, IdValidator, IdExistValidator],
})
export class AuthModule {}
