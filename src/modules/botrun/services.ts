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
    this.api.post('/compile', payload)
      .catch(() => undefined);
  }

  async stop(containerId: string) {
    const payload = { containerId };
    this.api.post('/stop', payload);
  }
}