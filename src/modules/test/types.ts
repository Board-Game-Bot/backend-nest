import { IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class TheObject {
    @IsNotEmpty()
      IsNotEmptyProp: string;
}

export class FooRequest {
    @IsString()
      StringProp: string;
    @IsNumber()
      NumberProp: number;
    @IsNotEmpty()
      IsNotEmptyProp: string;
    @ValidateNested()
    @Type(() => TheObject)
      TheObjectProp: TheObject;
}

