import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import './soku-games';
import {
  AuthorizationValidationErrorFilter,
  BusinessErrorFilter,
  FormatValidationErrorFilter,
  FormatValidationErrorPipe,
  InternalErrorFilter,
} from '@/response';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 开启跨域
  app.enableCors();

  // 开启格式验证
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useGlobalFilters(
    new InternalErrorFilter(),
    new BusinessErrorFilter(),
    new FormatValidationErrorFilter(),
    new AuthorizationValidationErrorFilter(),
  );
  app.useGlobalPipes(new FormatValidationErrorPipe({ transform: true }));

  // 开始监听
  await app.listen(3000);
}

bootstrap();
