import { IsInt, IsNotEmpty, IsOptional, IsString, Matches, Validate } from 'class-validator';
import { Type } from 'class-transformer';
import { GameIdExistValidator, GameIdValidator } from '@/modules/game/game-id-validator';
import { OnlyIdResponse } from '@/types';
import { CommonListRequest, CommonListResponse } from '@/response';
import { Game } from '@/entity';

export class CreateGameRequest {
    @Matches(/^[a-z][a-z0-9]+$/)
    @Validate(GameIdValidator)
      Id: string;
    @IsNotEmpty()
      Description: string;
    @IsNotEmpty()
      Icon: string;
    @IsInt()
    @Type(() => Number)
      PlayerCount: number;
    @IsNotEmpty()
      NpmPackage: string;
    @IsNotEmpty()
      Version: string;
}

export type CreateGameResponse = OnlyIdResponse;

export class ListGamesRequest extends CommonListRequest {}

export interface ListGamesResponse extends CommonListResponse<Game> {}

export class GetGameRequest {
    @IsNotEmpty()
    @Validate(GameIdExistValidator)
      Id: string;
}

export class DeleteGameRequest extends GetGameRequest {}

export class UpdateGameRequest {
    @IsNotEmpty()
    @Validate(GameIdExistValidator)
      Id: string;
    @IsOptional()
    @IsString()
      Description?: string;
    @IsOptional()
    @IsString()
      Icon?: string;
    @IsOptional()
    @IsInt()
    @Type(() => Number)
      PlayerCount?: number;
    @IsOptional()
    @IsString()
      NpmPackage?: string;
    @IsOptional()
    @IsString()
      Version?: string;
}