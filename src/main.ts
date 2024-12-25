import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
async function bootstrap() {

  const app = await NestFactory.create(AppModule);
 
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
    // {
    //   "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbTUyZ2RycTgwMDAwc2Q1eng1OTd5NHdsIiwiZW1haWwiOiIxMjM0NTY3OEB0ZXN0LmNvbSIsImlhdCI6MTczNTA0NTAzOSwiZXhwIjoxNzM1MDQ1OTM5fQ.qlZXnUflOevyWPsNDd2xq_HPurNDYEc9euTJEThmG8U",
    //   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbTUyZ2RycTgwMDAwc2Q1eng1OTd5NHdsIiwiZW1haWwiOiIxMjM0NTY3OEB0ZXN0LmNvbSIsImlhdCI6MTczNTA0NTAzOSwiZXhwIjoxNzM1NjQ5ODM5fQ.atVbBNeUb1rF5j1VZyT4qHto5rElow-qCPE8sGdcQtU"
    // }
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,           // 去除未定义的属性
    transform: true,           // 自动类型转换
    forbidNonWhitelisted: true // 禁止未定义的属性
  }));
  
  await app.listen(process.env.PORT ?? 3000);

}
bootstrap();
