import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('未提供token');
    }
   
    try {
      // 添加详细的验证选项
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET_KEY  // 确保使用相同的密钥
      });
      
      request['user'] = payload;
      return true;
    } catch (error) {
      // 添加详细的错误信息
      throw new UnauthorizedException(`Token验证失败: ${error.message}`);
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    console.log('Authorization Header:', request.headers.authorization); // 添加日志
    console.log('Token Type:', type);
    console.log('Token:', token);
    return type === 'Bearer' ? token : undefined;
  }
}
