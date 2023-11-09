import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';

@Entity()
export class Tape {
  @PrimaryColumn('varchar')
    id: string;
  @Column('varchar')
    gameId: string;
  @Column('json')
    json: string;
  @Column('varchar', { nullable: true })
    userId: string;

  @OneToMany(() => Participant, participant => participant.tape)
    participants: Participant[];
}

@Entity()
export class Participant {
  @PrimaryColumn('varchar')
    tapeId: string;
  @PrimaryColumn('smallint')
    index: number;
  @Column('varchar', { nullable: true })
    userId: string;
  @Column('varchar', { nullable: true })
    botId?: string;
  @Column('boolean')
    isWin: boolean;

  @ManyToOne(() => Tape, tape => tape.participants)
    tape: Tape;
}