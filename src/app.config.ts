import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TypedConfigModuleOptions } from 'nest-typed-config';

export class AppConfig {
  db!: TypeOrmModuleOptions;
  jwt!: JwtConfig;
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
