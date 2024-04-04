import { HttpException, HttpStatus } from '@nestjs/common';


export function makeFailure(message: string) {
  throw new HttpException(message, HttpStatus.BAD_REQUEST);
}

export function makeSuccess(data?: Record<string, any>) {
  return data;
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms || 1000));
}

export * from './downloadGame';
export * from './event-manager';