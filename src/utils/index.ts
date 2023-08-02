import { HttpException, HttpStatus } from '@nestjs/common';

export function makeFailure(message: string, data?: Record<string, any>) {
  throw new HttpException(
    {
      statusCode: 4000,
      message,
      extra: data,
    },
    HttpStatus.BAD_REQUEST,
  );
}

export function makeSuccess(data?: Record<string, any>) {
  return {
    statusCode: 200,
    data,
  };
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms || 1000));
}
