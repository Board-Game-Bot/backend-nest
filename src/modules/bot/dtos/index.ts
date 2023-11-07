import { IsOptional, Length } from 'class-validator';

// require jwt
export class CreateBotDto {
  gameId: string;
  langId: string;
  @Length(1, 32)
    name: string;
  @Length(0, 64)
    description: string;
  code: string;
}

// require jwt
export class RequestBotDto {}

export class SeeBotDto {
  userId: string;
}

// require jwt
export class UpdateBotDto {
  botId: string;
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
export class DeleteBotDto {
  botId: string;
}