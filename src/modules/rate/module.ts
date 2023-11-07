import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RateService } from './service';
import { RateController } from './controller';
import { Rate } from '@/entity/rate';

@Module({
  imports: [TypeOrmModule.forFeature([Rate])],
  providers: [RateService],
  controllers: [RateController],
})
export class RateModule {}