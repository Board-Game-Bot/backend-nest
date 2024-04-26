import { BusinessErrorException } from '@/response';

export const RequestFail = (message: string) => {
  throw new BusinessErrorException(message);
};