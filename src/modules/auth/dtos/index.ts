import { IsString, Length, Matches } from 'class-validator';
import { User } from '@/entity';

export class RegisterDto {
  @IsString()
  @Length(6, 18, { message: '账号长度控制在6-18以内' })
  @Matches(/^[a-zA-Z][a-zA-Z0-9_.]*$/, {
    message:
      '账号须满足大小写字母开头，并只能使用大小写字母、数字、下划线、小数点命名',
  })
    id: string;
  @IsString()
  @Length(6, 18, { message: '密码长度控制在6-18以内' })
    passwd: string;
  remember?: string;
}

export interface RegisterVo {
  user: User;
  jwt: string;
}

export class LoginDto {
  id: string;
  passwd: string;
  remember?: string;
}

export interface LoginVo {
  user: User;
  jwt: string;
}
