import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InnerModule } from '../inner';
import { RateService } from './service';
import { RateController } from './controller';
import { Rate } from '@/entity/rate';

@Module({
  imports: [
    TypeOrmModule.forFeature([Rate]),
    InnerModule.register(),
  ],
  providers: [RateService],
  controllers: [RateController],
})
export class RateModule {}