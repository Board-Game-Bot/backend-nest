import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BotController } from './controller';
import { BotService } from './service';
import { Bot } from '@/entity/bot';

@Module({
  imports: [TypeOrmModule.forFeature([Bot])],
  providers: [BotService],
  controllers: [BotController],
})
export class BotModule {}