import { IsJSON, IsNotEmpty, IsOptional, Length, Matches, Validate } from 'class-validator';
import { GameIdExistValidator } from '@/modules/game/game-id-validator';
import { TapeIdExistValidator } from '@/modules/tape/tape-id-validator';
import { CommonListRequest } from '@/response';

const Name = () => Matches(/^[\w_-]{1,32}$/);

export class CreateTapeRequest {
    @IsOptional()
    @Length(1, 18)
    @Name()
      Name?: string;
    @IsOptional()
    @Length(1, 300)
      Description?: string;
    @IsNotEmpty()
    @Validate(GameIdExistValidator)
      GameId: string;
    @IsNotEmpty()
    @IsJSON()
      Json: string;
}

export class GetTapeRequest {
    @IsNotEmpty()
    @Validate(TapeIdExistValidator)
      Id: string;
}

export interface ListTapesFilter {
    GameIds?: string[];
    UserIds?: string[];
}

export class ListTapesRequest extends CommonListRequest<ListTapesFilter> { }

export class UpdateTapeRequest {
    @IsNotEmpty()
    @Validate(TapeIdExistValidator)
      Id: string;
    @IsOptional()
    @Length(1, 18)
    @Name()
      Name?: string;
    @IsOptional()
    @Length(0, 300)
      Description?: string;
}

export class DeleteTapeRequest {
    @IsNotEmpty()
    @Validate(TapeIdExistValidator)
      Id: string;
}