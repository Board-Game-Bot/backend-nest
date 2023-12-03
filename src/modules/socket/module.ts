import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocketGateway } from './gateway';
import { RoomService } from './room.service';
import { GameService } from './game.service';
import { MatchPoolService } from './match-pool.service';
import { Rate } from '@/entity/rate';
import { RateService } from '@/modules/rate/service';
import { BotService } from '@/modules/bot/service';
import { Bot } from '@/entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rate, Bot])],
  providers: [
    SocketGateway,
    RoomService,
    GameService,
    MatchPoolService,
    RateService,
    BotService,
  ],
})
export class SocketModule {}