import { Column, Entity, PrimaryColumn } from 'typeorm';


@Entity()
export class Log {
  @PrimaryColumn({ type: 'varchar' })
    RequestId: string;
  @Column('text')
    Message: string;
}
