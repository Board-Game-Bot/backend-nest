import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '@/entity';

@ValidatorConstraint({ name: 'game-id-validator', async: true })
@Injectable()
export class GameIdValidator implements ValidatorConstraintInterface {
    @InjectRepository(Game)
      gameDao: Repository<Game>;

    async validate(id: string) {
      const entity = await this.gameDao.findOneBy({ Id: id });
      return !entity;
    }

    defaultMessage(args: ValidationArguments) {
      return `Game.Id ${args.value} already exist`;
    }
}

@ValidatorConstraint({ name: 'game-id-exist-validator', async: true })
@Injectable()
export class GameIdExistValidator implements ValidatorConstraintInterface {
    @InjectRepository(Game)
      gameDao: Repository<Game>;

    async validate(id: string) {
      const entity = await this.gameDao.findOneBy({ Id: id });
      return !!entity;
    }

    defaultMessage(args: ValidationArguments) {
      return `Game.Id ${args.value} does not exist`;
    }
}
