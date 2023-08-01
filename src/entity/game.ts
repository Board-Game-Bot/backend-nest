import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Game {
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @Column()
  name: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  icon: string;

  @Column()
  playerCount: number;
}
