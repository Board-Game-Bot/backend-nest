import { IsNotEmpty, IsOptional, Length, Matches, Validate } from 'class-validator';
import { Bot } from '@/entity';
import { BotStatus } from '@/types';
import { GameIdExistValidator } from '@/modules/game/game-id-validator';
import { CommonListRequest, CommonListResponse } from '@/response';
import { BotIdExistValidator } from '@/modules/bot/bot-id-validator';

const NameRegex = () => Matches(/^\w{1,18}$/);

export class CreateBotRequest {
  @IsOptional()
  @Length(1, 18)
  @NameRegex()
    Name?: string;
  @IsOptional()
  @Length(0, 300)
    Description?: string;
  @IsNotEmpty()
  @Validate(GameIdExistValidator)
    GameId: string;
  @IsNotEmpty()
    Lang: string;
  @IsNotEmpty()
    Code: string;
}

export class ListBotsFilter {
  GameIds?: string[];
  Langs?: string;
  Statuses?: BotStatus[];
  UserIds?: string[];
}

export class ListBotsRequest extends CommonListRequest<ListBotsFilter> {}

export interface ListBotsResponse extends CommonListResponse<Bot> {}

export class OnlyIdRequest {
  @IsNotEmpty()
  @Validate(BotIdExistValidator)
    Id: string;
}

export class GetBotRequest extends OnlyIdRequest {}

export class UpdateBotRequest {
  @IsNotEmpty()
  @Validate(BotIdExistValidator)
    Id: string;
  @IsOptional()
  @Length(1, 18)
  @NameRegex()
    Name?: string;
  @IsOptional()
  @Length(0, 300)
    Description?: string;
  @IsOptional()
    Code?: string;
}

export class DeleteBotRequest extends OnlyIdRequest { }

export class StartBotRequest extends OnlyIdRequest { }

export class StopBotRequest extends OnlyIdRequest { }

export class InnerUpdateStatusRequest {
  ContainerId: string;
  Status: BotStatus;
  Message?: string;
}