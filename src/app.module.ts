import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CardModule } from './Card/card.module';
import { UserFavoriteModule } from './UserFavorite/UserFavorite.module';
import { SearchModule } from './search/search.module';
import { MailModule } from './email/mail.module';
import { UrlModule } from './urlcheck/url-check.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    PrismaModule,
    CardModule,
    SearchModule,
    MailModule,
    UrlModule,
    UserFavoriteModule
  ],
})

export class AppModule {}
