import { IsNotEmpty, IsString, Length, Matches, Validate } from 'class-validator';
import { IdExistValidator, IdValidator } from '../id.validator';

export class RegisterAccountRequest {
  @IsString()
  @Length(6, 32, { message: '账号长度控制在 6-32 以内' })
  @Matches(/^[a-zA-Z][a-zA-Z0-9_-]{5,31}$/, { message: '账号须满足大小写字母开头，并只能使用大小写字母、数字、下划线、连接线命名' })
  @Validate(IdValidator)
    Id: string;
  @IsString()
  @Length(6, 18, { message: '密码长度控制在 6-18 以内' })
    Password: string;
}

export interface RegisterAccountResponse {
  Jwt: string;
}

export class LoginAccountRequest {
  @IsNotEmpty()
  @Validate(IdExistValidator)
    Id: string;
  @IsNotEmpty()
    Password: string;
}

export interface LoginAccountResponse {
  Jwt: string;
}
