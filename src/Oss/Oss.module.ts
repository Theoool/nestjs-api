// src/oss/oss.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import OSS from 'ali-oss';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'OSS_CLIENT',
      useFactory: (config: ConfigService) => new OSS({
        region: config.get('OSS_REGION'),
        accessKeyId: config.get('OSS_ACCESS_KEY_ID'),
        accessKeySecret: config.get('OSS_ACCESS_KEY_SECRET'),
        bucket: config.get('OSS_BUCKET'),
      }),
      inject: [ConfigService],
    },
  ],
  exports: ['OSS_CLIENT'],
})
export class OssModule {}
