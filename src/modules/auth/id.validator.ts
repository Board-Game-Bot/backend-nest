import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auth } from '@/entity';

@ValidatorConstraint({ name: 'id-validator', async: true })
@Injectable()
export class IdValidator implements ValidatorConstraintInterface {
    @InjectRepository(Auth)
      authDao: Repository<Auth>;

    async validate(id: string) {
      const entity = await this.authDao.findOneBy({ Id: id });
      return !entity;
    }

    defaultMessage(args: ValidationArguments) {
      return `Auth.Id ${args.value} already exist`;
    }
}

@ValidatorConstraint({ name: 'id-exist-validator', async: true })
@Injectable()
export class IdExistValidator implements ValidatorConstraintInterface {
    @InjectRepository(Auth)
      authDao: Repository<Auth>;

    async validate(id: string) {
      const entity = await this.authDao.findOneBy({ Id: id });
      return !!entity;
    }

    defaultMessage(args: ValidationArguments) {
      return `Auth.Id ${args.value} does not exist`;
    }
}