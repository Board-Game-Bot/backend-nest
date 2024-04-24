import { BaseExceptionFilter } from '@nestjs/core';
import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { InternalErrorResponse, ResponseResult } from '@/response/types';
import { safeJsonStringify } from '@/utils';

@Catch()
export class InternalErrorFilter extends BaseExceptionFilter {
  catch(error: Error, host: ArgumentsHost) {
    const errorPayload = {
      Name: error.name,
      Message: error.message,
      Stack: error.stack.split('\n').slice(0, 5),
    };
    const errorMessage = safeJsonStringify(errorPayload);

    const response: Omit<InternalErrorResponse, 'RequestId'> = {
      ResultType: ResponseResult.InternalError,
      ErrorMessage: errorMessage,
    };
    host.switchToHttp().getResponse().status(HttpStatus.OK).json(response);
  }
}