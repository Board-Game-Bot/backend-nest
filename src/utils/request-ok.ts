import { ResponseResult, SuccessResponse } from '@/response';

export type CommonResponseType<T = void> = Promise<Omit<SuccessResponse<T>, 'RequestId'>>;

export const RequestOk = (data: any): Omit<SuccessResponse, 'RequestId'> => {
  return {
    ResultType: ResponseResult.Success,
    Data: data,
  };
};