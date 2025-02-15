import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET_KEY,
    });
  }

  async validate(payload: any) {
    this.logger.debug('JWT Payload:', payload); // 添加日志
    
    return {
      userId: payload.sub,
      username: payload.username,
      email: payload.email,
      // 确保返回所有你需要的用户信息
      ...payload  // 临时添加，用于调试
    };
  }
}
