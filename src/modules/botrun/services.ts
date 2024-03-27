import { Inject, Injectable } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import { API_INSTANCE_KEY } from './constants';

@Injectable()
export class BotRunService {
  @Inject(API_INSTANCE_KEY)
    api: AxiosInstance;

  async createContainer(lang: string, code: string) {
    const payload = { lang, code };
    const res = await this.api.post('/create', payload);
    return res.data.containerId;
  }

  async compile(containerId: string) {
    const payload = { containerId };
    const res = await this.api.post('/compile', payload);
    return res.data.message;
  }

  async stop(containerId: string) {
    const payload = { containerId };
    return await this.api.post('/stop', payload);
  }
}