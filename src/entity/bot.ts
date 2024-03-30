import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';
import { BotStatus } from '@/types';

@Entity()
export class Bot {
  @PrimaryColumn('varchar')
    id: string;
  // 所属游戏
  @Column('varchar')
    gameId: string;
  // 语言
  @Column('varchar')
    langId: string;
  // 所属用户
  @Column('varchar')
    userId: string;
  // 名字
  @Column('varchar')
    name: string;
  // 描述
  @Column('text')
    description: string;
  @CreateDateColumn()
    createTime: Date;
  // 是否公开
  @Column('boolean')
    isPublic: boolean;
  // 代码
  @Column('text')
    code: string;
  @Column({
    type: 'enum',
    enum: BotStatus,
    default: BotStatus.Hibernating,
  })
    status: BotStatus;
  @Column('varchar', { nullable: true })
    containerId?: string;

  @Column('varchar', { nullable: true })
    statusMessage?: string;
}