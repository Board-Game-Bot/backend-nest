import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TapeService } from './service';
import { TapeController } from './controller';
import { Participant, Tape } from '@/entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tape, Participant])],
  providers: [TapeService],
  controllers: [TapeController],
})
export class TapeModule {}