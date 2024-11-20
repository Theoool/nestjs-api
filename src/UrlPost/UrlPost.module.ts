import { Module } from '@nestjs/common';
import { UrlPostController } from './UrlPost.controller';
import { urlPostService } from './UrlPost.service';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
    HttpModule,
  ],
  controllers: [UrlPostController],
  providers: [urlPostService],
})
export class UrlPostModule {}
