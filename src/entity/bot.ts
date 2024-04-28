import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';
import { BotStatus } from '@/types';

@Entity()
export class Bot {
  @PrimaryColumn('varchar')
    Id: string;
  @Column('varchar')
    Name: string;
  @Column('text', { nullable: true })
    Description: string;
  @Column('varchar')
    GameId: string;
  @Column('varchar')
    Lang: string;
  @Column('text')
    Code: string;
  @CreateDateColumn()
    CreateTime: Date;
  @Column({
    type: 'enum',
    enum: BotStatus,
    default: BotStatus.Hibernating,
  })
    Status: BotStatus;
  @Column('text', { nullable: true })
    StatusMessage?: string;
  @Column('varchar', { nullable: true })
    ContainerId?: string;
  @Column('varchar')
    UserId: string;
}