import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { Request } from 'express';

enum AuthErrorCode {
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  UNAUTHORIZED = 'UNAUTHORIZED',
}


@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
   
    if (!token) {
      throw new UnauthorizedException({
        code: AuthErrorCode.UNAUTHORIZED,
        message: '未提供访问令牌',
        timestamp: new Date().toISOString(),
      });
    }

    try {
    
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET_KEY  // 确保使用相同的密钥
      });
   
      
      request['user'] = payload;
      return true;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException({
          code: AuthErrorCode.TOKEN_EXPIRED,
          message: '访问令牌已过期',
          timestamp: new Date().toISOString(),
        });
      }

      throw new UnauthorizedException({
        code: AuthErrorCode.INVALID_TOKEN,
        message: '无效的访问令牌',
        timestamp: new Date().toISOString(),
        details: error.message,
      });
    
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
       
    if (type !== 'Bearer') {
      throw new UnauthorizedException({
        code: AuthErrorCode.INVALID_TOKEN,
        message: '非法的认证类型',
        timestamp: new Date().toISOString(),
      });
    }

    return token;
  }
}
