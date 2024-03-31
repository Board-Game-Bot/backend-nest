import { DynamicModule, Module } from '@nestjs/common';
import { AppConfig } from '@/app.config';

@Module({
  exports: ['INNER_TOKEN'],
})
export class InnerModule {
  static register(): DynamicModule {
    return {
      module: InnerModule,
      providers: [
        {
          provide: 'INNER_TOKEN',
          useFactory: (config: AppConfig) => {
            return config.inner.token;
          },
          inject: [AppConfig],
        },
      ],
    };
  }
}
