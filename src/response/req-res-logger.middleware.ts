import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { assign, omit } from 'lodash';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response as CommonResponse, ResponseResult } from './types';
import { safeJsonStringify } from '@/utils';
import { Log } from '@/entity';
import { generateId } from '@/response/utils';

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


          const reqId = generateId();
          if (ResBody.ResultType && ResBody.ResultType !== ResponseResult.Success) {
            const message = safeJsonStringify({ ReqHeader, ReqBody, ResBody });
            this.logDao.save({
              RequestId: reqId,
              Message: message,
            });
          }
          
          originJson(omit({
            ...ResBody,
            RequestId: reqId,
          }, 'ErrorMessage'));
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