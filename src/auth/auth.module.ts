import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import {PrismaModule} from '../prisma/prisma.module'
@Module({       
  imports: [
    ConfigModule,
    PassportModule,
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY, // 建议使用环境变量
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
