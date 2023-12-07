import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Game {
  @PrimaryColumn({ type: 'varchar' })
    id: string;
  @Column({ type: 'text' })
    description: string;
  @Column()
    icon: string;
  @Column({ type: 'smallint' })
    playerCount: number;
  @Column({ type: 'varchar', default: 'demo' })
    npmPackage: string;
  @Column({ type: 'varchar', default: '0.0.0' })
    version: string;
  @Column({ type: 'varchar', default: '' })
    url: string;
}
