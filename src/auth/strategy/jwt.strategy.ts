import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()



export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET_KEY, // 使用与 auth.module.ts 相同的密钥
    });

  }

  async validate(payload: any) {
   
    return { userId: payload.sub, 
      // accountStatus: payload.,
      username: payload.username };
  }
} 
