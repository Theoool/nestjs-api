// src/url-check/url-check.controller.ts
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UrlCheckService } from './url-check.service';
import { CheckUrlsDto } from './url-check.dto';

@Controller('url-check')
export class UrlCheckController {
  constructor(private readonly urlCheckService: UrlCheckService) {}

  @Post()
  async createCheckTask(
    @Body() dto: CheckUrlsDto,
    @Query('clientId') clientId: string // 从查询参数获取客户端ID
  ) {
    console.log(clientId,"clientId");
    
    const taskId = await this.urlCheckService.createTask(dto.urls, clientId);
    return { 
      taskId,
      message: '任务已接收',
      listenCommand: `使用WS客户端连接并监听任务ID: ${taskId}`
    };
  }

  @Get('status')
  async getWsStatus(@Query('taskId') taskId: string): Promise<any> {
    return this.urlCheckService.getTask(taskId);
  }
}
