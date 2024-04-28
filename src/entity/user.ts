/**
 * 用户信息模块
 */
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryColumn()
    Id: string;
  @Column()
    Name: string;
  @Column()
    Avatar: string;
}
