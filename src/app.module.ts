import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { fileLoader, TypedConfigModule } from 'nest-typed-config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfig, schemeValidator } from './app.config';

import { UserModule, AuthModule, SocketModule, GameModule, RateModule, BotModule, TapeModule } from './modules';
import { BotRunModule } from '@/modules/botrun/module';

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
    BotRunModule.register(),
    // BotRunModule.registerAsync({
    //   useFactory(config: AppConfig) {
    //     return { ...config.bot };
    //   },
    //   inject: [AppConfig],
    // }),
    UserModule,
    AuthModule,
    GameModule,
    RateModule,
    BotModule,
    TapeModule,
    SocketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
