import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Rate {
  @PrimaryColumn('varchar')
    userId: string;
  @PrimaryColumn('varchar')
    gameId: string;
  @PrimaryColumn('varchar')
    botId: string;
  @Column({ type: 'int' })
    score: number;
}