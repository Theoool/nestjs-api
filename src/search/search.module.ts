import { Global, Module,MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Typesense from 'typesense';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { AiConfigMiddleware } from 'src/common/middleware/ai-config.middleware';

@Global()
@Module({
  imports: [ConfigModule],
  controllers: [SearchController],
  providers: [
    {
      provide: 'TYPESENSE_CLIENT',
      useFactory: async (configService: ConfigService) => {
        // 硬编码本地开发配置
        const config = {
          host: 'localhost',  // 直接使用 localhost
          port: 8108,
          protocol: 'http',
          apiKey: 'xyz'  // 替换为你的实际 API key
        };
        console.log('正在连接 Typesense...配置:', {
          ...config,
          apiKey: '***'  // 日志中隐藏 API key
        });

        const client = new Typesense.Client({
          nodes: [{
            host: config.host,
            port: config.port,
            protocol: config.protocol,
          }],
          apiKey: config.apiKey,
          connectionTimeoutSeconds: 2,  // 降低超时时间便于调试
          numRetries: 3,
          retryIntervalSeconds: 1,
        });

        // 测试连接
        try {
          const health = await client.health.retrieve();
          console.log('Typesense 连接成功！服务状态:', health);
          return client;
        } catch (error) {
          console.error('Typesense 连接失败:', error);
          throw error;
        }
      },
      inject: [ConfigService],
    },
    SearchService
  ],
  
  exports: ['TYPESENSE_CLIENT', SearchService],
})
export class SearchModule { 
  configure(consumer: MiddlewareConsumer) {
  consumer
    .apply(AiConfigMiddleware).exclude(
      { path:'search/cards/advanced', method: RequestMethod.GET },
     { path:'search/cards/semantic', method: RequestMethod.GET },
    )
    .forRoutes({ path: 'search/cards*',
     method: RequestMethod.ALL })
  
}}

