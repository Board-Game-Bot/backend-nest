import { IsOptional, Length } from 'class-validator';
import { Bot } from '@/entity';

// require jwt
export class CreateDto {
  gameId: string;
  langId: string;
  @Length(0, 32)
  @IsOptional()
    name?: string;
  @Length(0, 64)
  @IsOptional()
    description?: string;
  code: string;
}

export interface CreateVo extends Bot { }

export interface GetVo {
  bots: Exclude<Bot, 'code'>[];
}

export interface CodeVo {
  code: string;
}

// require jwt
export class UpdateDto {
  id: string;
  @IsOptional()
    gameId: string;
  @IsOptional()
    langId: string;
  @IsOptional()
  @Length(1, 32)
    name: string;
  @IsOptional()
  @Length(0, 64)
    description: string;
  @IsOptional()
    isPublic: boolean;
  @IsOptional()
    code: string;
}

// require jwt
export class DeleteDto {
  botId: string;
}