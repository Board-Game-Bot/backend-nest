import { ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { valuesIn } from 'lodash';
import { FormatValidationException } from './format-validation.exception';

export class FormatValidationErrorPipe extends ValidationPipe {
  createExceptionFactory(): (validationErrors?: ValidationError[]) => unknown {
    return (validationErrors) => {
      const nestedMake = (errors: ValidationError[], prefix: string[] = [], map: Record<string, string> = {}) => {
        let newMap = { ...map };
        errors.forEach(error => {
          const newPrefix = [...prefix, error.property];
          const propertyName = newPrefix.join('.');
          newMap[propertyName] = valuesIn(error.constraints)[0];
          newMap = nestedMake(error.children, newPrefix, newMap);
        });
        return newMap;
      };
      const map = nestedMake(validationErrors);
      throw new FormatValidationException(map);
    };
  }
}