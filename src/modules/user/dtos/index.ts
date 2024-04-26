import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpdateUserRequest {
  @IsOptional()
  @IsString()
  @Length(6, 18)
  @Matches(/^\w*$/)
    Name?: string;
  @IsOptional()
  @IsString()
    Avatar?: string;
}
