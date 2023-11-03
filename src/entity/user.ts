/**
 * 用户信息模块
 */
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryColumn()
    id: string;
  @Column()
    name: string;
  @Column()
    avatar: string;
}
