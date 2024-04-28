import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TapeService } from './service';
import { TapeController } from './controller';
import { TapeIdExistValidator, TapeIdValidator } from './tape-id-validator';
import { Tape } from '@/entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tape])],
  providers: [TapeService, TapeIdValidator, TapeIdExistValidator],
  controllers: [TapeController],
})
export class TapeModule {}