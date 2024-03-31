import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TypedConfigModuleOptions } from 'nest-typed-config';

export class BotConfig {
  protocol: string;
  host: string;
  port: string;
}

export class InnerConfig {
  token: string;
}

export class AppConfig {
  db!: TypeOrmModuleOptions;
  jwt!: JwtConfig;
  bot!: BotConfig;
  inner!: InnerConfig;
}

class JwtConfig {
  secret: string;
  expired: string;
}

export const schemeValidator: TypedConfigModuleOptions['validate'] = (
  config: AppConfig,
) => {
  return config;
};
