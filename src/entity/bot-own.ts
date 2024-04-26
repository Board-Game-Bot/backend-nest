import { Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class BotOwn {
  @PrimaryColumn('varchar')
    UserId: string;
  @PrimaryColumn('varchar')
    BotId: string;
}