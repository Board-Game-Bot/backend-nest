import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { BusinessErrorException } from './business-error.exception';
import { BusinessErrorResponse, ResponseResult } from './types';

@Catch(BusinessErrorException)
export class BusinessErrorFilter implements ExceptionFilter {
  catch(exception: BusinessErrorException, host: ArgumentsHost) {
    const response: Omit<BusinessErrorResponse, 'RequestId'> = {
      ResultType: ResponseResult.BusinessError,
      Message: exception.message,
    };
    host.switchToHttp().getResponse().status(HttpStatus.OK).json(response);
  }
}