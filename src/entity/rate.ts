import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Rate {
  @PrimaryColumn('varchar')
    UserId: string;
  @PrimaryColumn('varchar')
    GameId: string;
  @PrimaryColumn('varchar')
    BotId: string;
  @Column('int', { default: 1500 })
    Score: number;
  // 用于获取排名的 column
  @Column({ select: false, default: 0 })
    Rank?: number;
}