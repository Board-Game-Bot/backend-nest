import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Game {
  @PrimaryColumn({ type: 'varchar' })
    Id: string;
  @Column({ type: 'text' })
    Description?: string;
  @Column()
    Icon: string;
  @Column({ type: 'smallint' })
    PlayerCount: number;
  @Column({ type: 'varchar' })
    NpmPackage: string;
  @Column({ type: 'varchar' })
    Version: string;
}