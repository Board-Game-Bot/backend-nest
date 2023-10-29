import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpdateDto {
  @IsOptional()
  @IsString()
  @Length(6, 18)
  @Matches(/^[a-zA-Z][a-zA-Z0-9_.]*$/)
  name?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}

export interface UpdateVo {}
