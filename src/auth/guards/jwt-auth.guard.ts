import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    // console.log(err, user, info);
    
    // 如果验证失败，抛出异常
    if (err || !user) {
      console.log("未授权");
      
      throw err || new UnauthorizedException('未授权访问');
    }
    return user;
  }
}
