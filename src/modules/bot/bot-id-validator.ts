import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bot } from '@/entity';

@ValidatorConstraint({ name: 'bot-id-validator', async: true })
@Injectable()
export class BotIdValidator implements ValidatorConstraintInterface {
    @InjectRepository(Bot)
      botDao: Repository<Bot>;

    async validate(id: string) {
      const entity = await this.botDao.findOneBy({ Id: id });
      return !entity;
    }

    defaultMessage(args: ValidationArguments) {
      return `Bot.Id ${args.value} already exist`;
    }
}

@ValidatorConstraint({ name: 'bot-id-exist-validator', async: true })
@Injectable()
export class BotIdExistValidator implements ValidatorConstraintInterface {
    @InjectRepository(Bot)
      botDao: Repository<Bot>;

    async validate(id: string) {
      const entity = await this.botDao.findOneBy({ Id: id });
      return !!entity;
    }

    defaultMessage(args: ValidationArguments) {
      return `Bot.Id ${args.value} does not exist`;
    }
}
