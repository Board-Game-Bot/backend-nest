import { Module } from '@nestjs/common';
import { AuthController } from '@/modules/auth/auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth } from '@/entity/auth';
import { AuthService } from '@/modules/auth/auth.service';
import { User } from '@/entity/user';

@Module({
  imports: [TypeOrmModule.forFeature([Auth, User])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
