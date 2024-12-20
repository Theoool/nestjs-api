import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CardModule } from './Card/card.module';
import { UserFavoriteModule } from './UserFavorite/UserFavorite.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    PrismaModule,
    CardModule,
    UserFavoriteModule
  ],
})

export class AppModule {}
