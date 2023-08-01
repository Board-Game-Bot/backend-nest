import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { fileLoader, TypedConfigModule } from 'nest-typed-config';
import { AppConfig, schemeValidator } from '@/app.config';
import { UserModule } from '@/modules/user/user.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { GameModule } from '@/modules/game/game.module';
import { RankModule } from '@/modules/rank/rank.module';
import { RecordModule } from '@/modules/record/record.module';

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
