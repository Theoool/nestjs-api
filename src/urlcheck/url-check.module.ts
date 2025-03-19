import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { UrlCheckService } from './url-check.service';
import { UrlCheckController } from './url-check.controller';
import { WebsocketGateway } from './websocket.gateway';

@Global()
@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [UrlCheckController],
  providers: [
    UrlCheckService,
    WebsocketGateway
  ],
  exports: [UrlCheckService],
})
export class UrlModule {}
