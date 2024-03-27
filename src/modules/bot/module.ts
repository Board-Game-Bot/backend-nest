import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BotController } from './controller';
import { BotService } from './service';
import { Bot } from '@/entity/bot';
import { BotRunModule } from '@/modules/botrun/module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bot]),
    BotRunModule.register(),
  ],
  providers: [
    BotService,
  ],
  controllers: [BotController],
})
export class BotModule {}