import { Module } from '@nestjs/common';
import { SocketGateway } from './gateway';
import { RoomService } from './room.service';
import { GameService } from './game.service';
import { MatchPoolService } from './match-pool.service';

@Module({
  providers: [SocketGateway, RoomService, GameService, MatchPoolService],
})
export class SocketModule {}