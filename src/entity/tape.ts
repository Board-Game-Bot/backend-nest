import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Tape {
  @PrimaryColumn('varchar')
    Id: string;
  @Column()
    Name: string;
  @Column('text', { nullable: true })
    Description: string;
  @Column('varchar')
    GameId: string;
  @Column('json')
    Json: string;
  @Column('varchar')
    UserId: string;
  @CreateDateColumn()
    CreateTime: Date;
}
