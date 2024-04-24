import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { assign } from 'lodash';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response as CommonResponse } from './types';
import { ResponseResult } from '@/response/types';
import { safeJsonStringify } from '@/utils';
import { Log } from '@/entity';
import { generateRequestId } from '@/response/utils';

@Injectable()
export class ReqResLoggerMiddleware implements NestMiddleware {
  @InjectRepository(Log)
    logDao: Repository<Log>;

  async use(req: Request, res: Response, next: NextFunction) {
    const originJson = res.json.bind(res);

    assign(res, {
      json: (payload: unknown) => {
        try {
          const ReqHeader = req.headers;
          const ReqBody = req.body;
          const ResBody = payload as CommonResponse;
          if (ResBody.ResultType === ResponseResult.InternalError) {
            delete ResBody.ErrorMessage;
          }
          const message = safeJsonStringify({ ReqHeader, ReqBody, ResBody });

          const reqId = generateRequestId();
          this.logDao.save({
            RequestId: reqId,
            Message: message,
          });
          originJson({
            ...ResBody,
            RequestId: reqId,
          });
        }
        catch (e) {
          res.json({
            RequestId: 'Logger panic!',
            ResultType: ResponseResult.InternalError,
            Error: e,
          });
        }
      },
    });
    next();
  }
}