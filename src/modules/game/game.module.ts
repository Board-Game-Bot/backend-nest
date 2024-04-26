import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { GameIdExistValidator, GameIdValidator } from './game-id-validator';
import { Game } from '@/entity/game';

@Module({
  imports: [TypeOrmModule.forFeature([Game])],
  controllers: [GameController],
  providers: [GameService, GameIdValidator, GameIdExistValidator],
})
export class GameModule {}
