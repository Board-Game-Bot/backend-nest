import { Column, Entity, PrimaryColumn } from 'typeorm';


@Entity()
export class Log {
  @PrimaryColumn({ type: 'char', length: 21 })
    RequestId: string;
  @Column('text')
    Message: string;
}
