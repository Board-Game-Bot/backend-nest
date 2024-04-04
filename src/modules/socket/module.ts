import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocketGateway } from './gateway';
import { RoomService } from './room.service';
import { OnlineGameService } from './online-game.service';
import { MatchPoolService } from './match-pool.service';
import { CustomModeService } from './custom-mode.service';
import { Rate } from '@/entity/rate';
import { RateService } from '@/modules/rate/service';
import { BotService } from '@/modules/bot/service';
import { Bot, Game } from '@/entity';
import { BotRunModule } from '@/modules/botrun/module';
import { GameService } from '@/modules/game/game.service';

@Module({
  imports: [TypeOrmModule.forFeature([Rate, Bot, Game]), BotRunModule.register()],
  providers: [
    SocketGateway,
    RoomService,
    GameService,
    OnlineGameService,
    CustomModeService,
    MatchPoolService,
    RateService,
    BotService,
  ],
})
export class SocketModule {}