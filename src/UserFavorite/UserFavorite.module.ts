import { Module } from '@nestjs/common';
import { UserFavoriteController } from './UserFavorite.controller';
import { UserFavoriteService     } from './UserFavorite.service';
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
  controllers: [UserFavoriteController],
  providers: [UserFavoriteService],
})
export class UserFavoriteModule {}

