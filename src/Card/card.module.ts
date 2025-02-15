import { Module } from '@nestjs/common';
import { cardController } from './card.controller';
import { cardService } from './card.service';
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
  controllers: [cardController],
  providers: [cardService],
  exports: [cardService],
})
export class CardModule {}
