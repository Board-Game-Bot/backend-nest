import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tape } from '@/entity';

@ValidatorConstraint({ name: 'tape-id-validator', async: true })
@Injectable()
export class TapeIdValidator implements ValidatorConstraintInterface {
    @InjectRepository(Tape)
      tapeDao: Repository<Tape>;

    async validate(id: string) {
      const entity = await this.tapeDao.findOneBy({ Id: id });
      return !entity;
    }

    defaultMessage(args: ValidationArguments) {
      return `Tape.Id ${args.value} already exist`;
    }
}

@ValidatorConstraint({ name: 'tape-id-exist-validator', async: true })
@Injectable()
export class TapeIdExistValidator implements ValidatorConstraintInterface {
    @InjectRepository(Tape)
      tapeDao: Repository<Tape>;

    async validate(id: string) {
      const entity = await this.tapeDao.findOneBy({ Id: id });
      return !!entity;
    }

    defaultMessage(args: ValidationArguments) {
      return `Tape.Id ${args.value} does not exist`;
    }
}
