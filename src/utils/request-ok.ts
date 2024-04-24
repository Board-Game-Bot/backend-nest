import { ResponseResult, SuccessResponse } from '@/response';

export const RequestOk = (data: any): Omit<SuccessResponse, 'RequestId'> => {
  return {
    ResultType: ResponseResult.Success,
    Data: data,
  };
};