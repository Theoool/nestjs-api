import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { DEFAULT_AI_CONFIG } from '../config/ai.config';
import Redis from 'ioredis';

@Injectable()
export class AiConfigMiddleware implements NestMiddleware {
  private redis: Redis;
  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      maxRetriesPerRequest: 3
    });
  }

  async use(req: Request, res: Response, next: NextFunction) {
    // 合并配置
    req['aiConfig'] = {
      ...DEFAULT_AI_CONFIG,
      ...this.getConfigFromRequest(req)
    };

    // IP限流逻辑
    const clientIp = req.ip;
    const key = `ai_rate_limit:${clientIp}`;
    const now = Date.now();
    
    try {
      const {modelName}=this.getConfigFromRequest(req)
      if (modelName) {
        next();
        return;
      }
      // 滑动窗口算法实现
      const pipeline = this.redis.pipeline();
      pipeline.zadd(key, now, now);
      pipeline.zremrangebyscore(key, 0, now - 24 * 60 * 60 * 1000);
      pipeline.zcard(key);
      pipeline.expire(key, 24 * 60 * 60);
      const results = await pipeline.exec() as Array<[Error | null, number]>;
      // 检查命令执行结果
      const hasCommandError = results.some(([err]) => err);
      if (hasCommandError) {
        console.error('Redis命令执行错误:', results);
        res.status(500).json({ message: '服务器内部错误' });
        return;
      }

      // 明确获取ZCARD命令的结果
      const count = results[2][1];
      
      if (count >= 100) {
        res.status(429).json({ message: '请求过于频繁' });
        return;
      }
    } catch (error) {
      console.error('限流异常:', error);
    }
    next();
  }

  private getConfigFromRequest(req: Request) {
    console.log('完整headers:', req.headers);
    console.log('请求路径:', req.url);
    console.log('请求方法:', req.method);
    console.log('请求Body内容:', JSON.stringify(req.body));
    const getHeader = (name: string) => {
      const lowerName = name.toLowerCase();
      return req.headers[Object.keys(req.headers).find(k => k.toLowerCase() === lowerName)] || req.body?.[name.toLowerCase()];
    };

    console.log({
      modelName: getHeader('x-ai-model') || req.query.model,
      openAIApiKey: getHeader('x-api-key'),
      baseURL: getHeader('x-ai-baseurl')
    });
const {model,apikey,baseurl}=req.body
    return {
      modelName: getHeader('x-ai-model') ||model || req.query.model,
      openAIApiKey: getHeader('x-api-key')||apikey,
      baseURL: getHeader('x-ai-baseurl')||baseurl
    };
  }
}
