import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { fileLoader, TypedConfigModule } from 'nest-typed-config';
import { AppConfig, schemeValidator } from '@/app.config';
import { UserModule } from '@/modules/user/user.module';

@Module({
  imports: [
    TypedConfigModule.forRoot({
      schema: AppConfig,
      load: fileLoader(),
      validate: schemeValidator,
    }),
    // TODO: Why useFactory, forRootAsync
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
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
