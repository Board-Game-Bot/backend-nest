import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { fileLoader, TypedConfigModule } from 'nest-typed-config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfig, schemeValidator } from './app.config';

import { UserModule, AuthModule, GameModule, BotModule, TapeModule, RateModule } from './modules';
import { TestController } from '@/modules/test';
import { ReqResLoggerMiddleware } from '@/response';
import { Log } from '@/entity';

@Module({
  imports: [
    TypedConfigModule.forRoot({
      schema: AppConfig,
      load: fileLoader(),
      validate: schemeValidator,
    }),
    TypeOrmModule.forRootAsync({
      useFactory(config: AppConfig): TypeOrmModuleOptions {
        return {
          ...config.db,
          synchronize: true,
          autoLoadEntities: true,
          logging: false,
        };
      },
      inject: [AppConfig],
    }),
    JwtModule.registerAsync({
      useFactory(config: AppConfig): JwtModuleOptions {
        return {
          ...config.jwt,
        };
      },
      inject: [AppConfig],
      global: true,
    }),
    UserModule,
    AuthModule,
    GameModule,
    BotModule,
    TapeModule,
    RateModule,
    // SocketModule,
    TypeOrmModule.forFeature([Log]),
  ],
  controllers: [AppController, TestController],
  providers: [AppService],
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ReqResLoggerMiddleware)
      .forRoutes('/api/*');
  }
}
