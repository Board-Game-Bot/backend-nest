import { Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { FormatValidationException } from './format-validation.exception';
import { FormatErrorResponse, ResponseResult } from '.';

@Catch(FormatValidationException)
export class FormatValidationErrorFilter implements ExceptionFilter {
  catch(error: FormatValidationException, host) {
    const response: Omit<FormatErrorResponse, 'RequestId'> = {
      ResultType: ResponseResult.FormatError,
      FormatMessage: error.getResponse() as Record<string, string>,
    };
    const ctx = host.switchToHttp();
    ctx.getResponse().status(HttpStatus.OK).json(response);
  }
}