import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Game {
  // 同时作为游戏的英文名
  @PrimaryColumn({ type: 'varchar' })
    id: string;
  // 游戏描述
  @Column({ type: 'text' })
    description: string;
  // 这个暂时可以先用 emoji 来代替，后续应该可以用 iconify 的某些词来代替
  @Column()
    icon: string;
  // 此游戏的游戏玩家数量
  @Column({ type: 'smallint' })
    playerCount: number;
}
