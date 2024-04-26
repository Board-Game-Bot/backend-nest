import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BotRunModule } from '../botrun/module';
import { InnerModule } from '../inner';
import { BotController } from './controller';
import { BotService } from './service';
import { BotIdExistValidator, BotIdValidator } from './bot-id-validator';
import { Bot } from '@/entity/bot';


@Module({
  imports: [
    TypeOrmModule.forFeature([Bot]),
    BotRunModule.register(),
    InnerModule.register(),
  ],
  providers: [
    BotService,
    BotIdValidator,
    BotIdExistValidator,
  ],
  controllers: [BotController],
})
export class BotModule {}