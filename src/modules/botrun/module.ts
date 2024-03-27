import { DynamicModule, Module } from '@nestjs/common';
import axios from 'axios';
import { isUndefined } from 'lodash';
import { API_INSTANCE_KEY } from './constants';
import { AppConfig } from '@/app.config';
import { BotRunService } from '@/modules/botrun/services';

@Module({
  exports: [BotRunService],
})
export class BotRunModule {
  static register(): DynamicModule {
    return {
      module: BotRunModule,
      providers: [BotRunService, {
        provide: API_INSTANCE_KEY,
        useFactory: (config: AppConfig) => {
          const { bot } = config;
          const { protocol, port, host } = bot;
          return axios.create({
            baseURL: `${protocol}://${host}${!isUndefined(port) ? ':' + port : ''}`,
          });
        },
        inject: [AppConfig],
      }],
    };
  }
}