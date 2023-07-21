import { IsString, Length, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  @Length(6, 18, { message: '账号长度控制在6-18以内' })
  @Matches(/^[a-zA-Z][a-zA-Z0-9_.]*$/, {
    message:
      '账号须满足大小写字母开头，并只能使用大小写字母、数字、下划线、小数点命名',
  })
  account: string;

  @IsString()
  @Length(6, 18, { message: '密码长度控制在6-18以内' })
  passwd: string;

  remember?: string;
}

export class LoginDto {
  account: string;

  passwd: string;

  remember?: string;
}
