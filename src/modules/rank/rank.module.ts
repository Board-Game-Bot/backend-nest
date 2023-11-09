import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RankController } from '@/modules/rank/rank.controller';
import { RankService } from '@/modules/rank/rank.service';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [RankController],
  providers: [RankService],
})
export class RankModule {}
