/**
 * 用户鉴权模块
 */
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Auth {
  @PrimaryColumn()
    id: string;
  @Column()
    passwd: string;
}
