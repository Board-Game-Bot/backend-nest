import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

/**
 * 内部接口路由守卫
 * 用法：
 * - 给接口加上 @UseGuards(InnerGuard)
 */
@Injectable()
export class InnerGuard implements CanActivate {
  @Inject('INNER_TOKEN')
    innerToken: string;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['x-inner-token'];

    if (token !== this.innerToken) {
      throw new UnauthorizedException();
    }
    return true;
  }
}

