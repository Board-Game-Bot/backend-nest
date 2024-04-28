import { BaseExceptionFilter } from '@nestjs/core';
import { ArgumentsHost, Catch, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { AuthorizationErrorResponse, ResponseResult } from '@/response/types';

@Catch(UnauthorizedException)
export class AuthorizationValidationErrorFilter extends BaseExceptionFilter {
  catch(_: unknown, host: ArgumentsHost) {
    const response: Omit<AuthorizationErrorResponse, 'RequestId'> = {
      ResultType: ResponseResult.AuthorizationError,
    };
    host
      .switchToHttp()
      .getResponse()
      .status(HttpStatus.OK)
      .json(response);
  }
}