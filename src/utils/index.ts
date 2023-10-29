import { HttpException, HttpStatus } from '@nestjs/common';

export function makeFailure(message: string) {
  throw new HttpException(message, HttpStatus.BAD_REQUEST);
}

export function makeSuccess(data?: Record<string, any>) {
  return data;
}
