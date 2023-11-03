import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { fileLoader, TypedConfigModule } from 'nest-typed-config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfig, schemeValidator } from './app.config';

import { UserModule, AuthModule } from './modules';
import { RecordModule } from '@/modules/record/record.module';
import { RankModule } from '@/modules/rank/rank.module';
import { GameModule } from '@/modules/game/game.module';

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
          ...config,
          secret: config.jwt.secret,
        };
      },
      inject: [AppConfig],
      global: true,
    }),
    UserModule,
    AuthModule,
    GameModule,
    RankModule,
    RecordModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
