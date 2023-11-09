import { Column } from 'typeorm';

export class Rate {
  @Column({ type: 'varchar' })
    userId: string;
  @Column({ type: 'varchar' })
    gameId: string;
  @Column({ type: 'varchar', nullable: true })
    botId: string;
  @Column({ type: 'int' })
    score: number;
}