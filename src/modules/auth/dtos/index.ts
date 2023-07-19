import { IsString, Length, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  @Length(6, 18, { message: '长度控制在6-18以内' })
  @Matches(/[a-zA-Z][a-zA-Z0-9_.]*/)
  account: string;

  @IsString()
  @Length(6, 18, { message: '长度控制在6-18以内' })
  passwd: string;

  remember?: string;
}

export class LoginDto {
  account: string;

  passwd: string;

  remember?: string;
}
