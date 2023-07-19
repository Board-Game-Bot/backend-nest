import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { useContainer } from 'class-validator';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 开启跨域
  app.enableCors();

  // 开启格式验证
  useContainer(app.select(AppModule), {
    fallbackOnErrors: true,
  });
  app.useGlobalPipes(new ValidationPipe());

  // 开始监听
  await app.listen(3000);
}

bootstrap();
