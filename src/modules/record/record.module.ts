import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecordController } from '@/modules/record/record.controller';
import { RecordService } from '@/modules/record/record.service';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [RecordController],
  providers: [RecordService],
})
export class RecordModule {}
