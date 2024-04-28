import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Auth } from '@/entity';

/**
 * 路由守卫
 * 用于给某些路由加上Jwt验证
 * 用法：
 * - 给接口加上 @UseGuards(AuthGuard)
 */
@Injectable()
export class AdminGuard implements CanActivate {
  @Inject()
    jwtService: JwtService;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const user: Auth = this.jwtService.verify(token);
      if (user.Id !== 'Andrew') {
        throw new UnauthorizedException();
      }
      try {
        request['user'] = this.jwtService.verify(token);
        return true;
      }
      catch {
        throw new UnauthorizedException();
      }
    }
    catch {
      throw new UnauthorizedException();
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : '';
  }
}

