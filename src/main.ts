import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 使用导入的 cors
  app.use(cors({
    allowedHeaders: ['x-ai-model', 'x-api-key', 'x-ai-baseurl', 'Content-Type', 'Authorization']
  }));
  app.enableCors({
    allowedHeaders: ['x-ai-model', 'x-api-key', 'x-ai-baseurl', 'Content-Type', 'Authorization']
  });
  app.use(require('body-parser').json({ limit: '10mb' }));
  const config = new DocumentBuilder()
    .setTitle('API 文档')
    .setDescription('API 描述')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: '输入 JWT token',
        in: 'header',
      },
      "JWT"
    )
    .build();
   
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,           // 去除未定义的属性
    transform: true,           // 自动类型转换
    // forbidNonWhitelisted: true // 禁止未定义的属性
  }));
  
  
  await app.listen(process.env.PORT ?? 3000);

}
bootstrap();
