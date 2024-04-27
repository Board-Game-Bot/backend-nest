import { IsBoolean, IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { CommonListRequest, CommonListResponse } from '@/response';
import { Rate } from '@/entity/rate';


export class OnlyRateId {
  @IsNotEmpty()
    UserId: string;
  @IsNotEmpty()
    GameId: string;
  @IsOptional()
    BotId = '';
}

export class CreateRateRequest extends OnlyRateId {
  Score?: number;
}

export class GetRateRequest extends OnlyRateId {}

export interface ListRatesFilter {
  UserIds?: string[];
  GameIds?: string[];
  BotIds?: string[];
}

export class ListRatesRequest extends CommonListRequest<ListRatesFilter> {
  @IsOptional()
  @IsBoolean()
    WithRank?: boolean;
}

export interface WithRankRate extends Rate {
  Rank?: number;
}

export interface ListRatesResponse extends CommonListResponse<WithRankRate> {}

export class UpdateRateRequest extends OnlyRateId {
  @IsOptional()
  @IsInt()
    Score?: number;
}