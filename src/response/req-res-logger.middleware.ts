import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { assign, omit } from 'lodash';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response as CommonResponse, ResponseResult } from './types';
import { MakeIdGenerator, safeJsonStringify } from '@/utils';
import { Log } from '@/entity';


@Injectable()
export class ReqResLoggerMiddleware implements NestMiddleware {
  @InjectRepository(Log)
    logDao: Repository<Log>;

  static generateId: () => string;

  async use(req: Request, res: Response, next: NextFunction) {
    if (!ReqResLoggerMiddleware.generateId) {
      ReqResLoggerMiddleware.generateId = MakeIdGenerator('log');
    }
    const originJson = res.json.bind(res);

    assign(res, {
      json: (payload: unknown) => {
        try {
          const ReqHeader = req.headers;
          const ReqBody = req.body;
          const ResBody = payload as CommonResponse;


          const reqId = ReqResLoggerMiddleware.generateId();
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
          originJson({
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