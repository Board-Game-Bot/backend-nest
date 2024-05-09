import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocketGateway } from './gateway';
import { Rate } from '@/entity/rate';
import { RateService } from '@/modules/rate/service';
import { BotService } from '@/modules/bot/service';
import { Bot, Game } from '@/entity';
import { BotRunModule } from '@/modules/botrun/module';
import { GameService } from '@/modules/game/game.service';
import { UserModule } from '@/modules';
import { MatchPools } from '@/modules/socket/match';
import { RoomManager } from '@/modules/socket/room';

@Module({
  imports: [TypeOrmModule.forFeature([Bot, Game, Rate]), BotRunModule.register(), UserModule],
  providers: [
    SocketGateway,
    GameService,
    RateService,
    BotService,
    MatchPools,
    RoomManager,
  ],
  exports: [SocketGateway],
})
export class SocketModule {}