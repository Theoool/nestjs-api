import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { WebsocketGateway } from './websocket.gateway';

interface Task {
  id: string;
  clientId?: string; // 关联的WebSocket客户端ID
  total: number;
  processed: number;
  successCount: number;
  failCount: number;
  results: any[];
  status: 'pending' | 'processing' | 'completed';
}


@Injectable()
export class UrlCheckService {
  private readonly logger = new Logger(UrlCheckService.name);
  private tasks = new Map<string, Task>(); // 内存存储任务
  private readonly CONCURRENCY = 10; // 最大并发数

  constructor(
    private readonly httpService: HttpService,
    private readonly wsGateway: WebsocketGateway
  ) {
    this.logger.log('UrlCheckService 初始化完成');
  }

  async createTask(urls: string[], clientId?: string): Promise<string> {
    const taskId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    this.logger.log(`创建新任务: ${taskId}, URL数量: ${urls.length}, 客户端ID: ${clientId || '无'}`);
    
    this.tasks.set(taskId, {
      id: taskId,
      clientId,
      total: urls.length,
      processed: 0,
      successCount: 0,
      failCount: 0,
      results: [],
      status: 'pending'
    });
    

    // 异步启动处理
    this.processTask(taskId, urls).catch(err => {
      this.logger.error(`任务 ${taskId} 处理失败: ${err.message}`, err.stack);
    });

    return taskId;
  }

  private async processTask(taskId: string, urls: string[]) {
    const task = this.tasks.get(taskId);
    if (!task) {
      this.logger.warn(`任务 ${taskId} 不存在，无法处理`);
      return;
    }

    this.logger.log(`开始处理任务 ${taskId}, URL数量: ${urls.length}`);
    task.status = 'processing';
    const queue = [...urls];
    const results = [];

    // 创建并发工作池
    const workers = Array(this.CONCURRENCY).fill(null).map(async (_, workerId) => {
      this.logger.debug(`工作线程 ${workerId} 已启动`);
      while (queue.length > 0) {
        const url = queue.pop();
        if (!url) continue;

        this.logger.debug(`工作线程 ${workerId} 处理URL: ${url}`);
        try {
          const result = await this.checkUrl(url);
          
          // 更新任务状态
          task.processed++;
          
          if (result.status >= 400) {
            // 处理失败的URL (状态码 >= 400)
            task.failCount++;
            this.logger.warn(`URL ${url} 检查失败: 状态码 ${result.status}`);
            results.push({ 
              url, 
              error: `HTTP错误: ${result.status}`, 
              success: false,
              status: result.status,
              latency: result.latency
            });
          } else {
            // 处理成功的URL (状态码 < 400)
            task.successCount++;
            this.logger.debug(`URL ${url} 检查成功, 状态码: ${result.status}`);
            results.push(result);
          }
          
          this.sendProgressUpdate(task);
        } catch (error) {
          // 处理请求异常
          task.processed++;
          task.failCount++;
          this.logger.warn(`URL ${url} 检查失败: ${error.message}`);
          results.push({ 
            url, 
            error: error.message, 
            success: false 
          });
          this.sendProgressUpdate(task);
        }
      }
    });

    await Promise.all(workers);
    
    // 完成处理
    task.status = 'completed';
    task.results = results;
    this.logger.log(`任务 ${taskId} 已完成, 成功: ${task.successCount}, 失败: ${task.failCount}`);
    this.sendProgressUpdate(task,results);
  }

  private async checkUrl(url: string) {
    const start = Date.now();
    try {
      this.logger.debug(`开始检查URL: ${url}`);
      const response = await firstValueFrom(
        this.httpService.head(url, {
          timeout: 5000,
          headers: { 'User-Agent': 'NestJS UrlChecker' },
          validateStatus: () => true
        })
      );
      const latency = Date.now() - start;
      this.logger.debug(`URL ${url} 响应状态: ${response.status}, 延迟: ${latency}ms`);
      
      return {
        url,
        finalUrl: response.request.res.responseUrl,
        status: response.status,
        latency: latency,
        success: true 
      };
    } catch (error) {
      this.logger.error(`检查URL ${url} 时发生错误`, error);
      throw new Error(this.parseError(error));
    }
  }
  
  parseError(error: any): string {
    this.logger.debug('解析错误', error);
    // 实现错误解析逻辑，而不是抛出异常
    if (error.code === 'ECONNREFUSED') {
      return '连接被拒绝';
    } else if (error.code === 'ETIMEDOUT') {
      return '连接超时';
    } else if (error.response) {
      return `HTTP错误: ${error.response.status}`;
    } else {
      return error.message || '未知错误';
    }
  }
  
  private sendProgressUpdate(task: Task, results?: any[]) {

    if (!task.clientId) {
      this.logger.debug(`任务 ${task.id} 没有关联客户端ID，跳过进度更新`);
      return;
    }

    const progress = {
      taskId: task.id,
      status: task.status,
      progress: {
        total: task.total,
        processed: task.processed,
        success: task.successCount,
        failed: task.failCount,
        percentage: Math.round((task.processed / task.total) * 100)
      },
      latestResult: task.results[task.results.length - 1]
    };

    this.logger.debug(`发送进度更新到客户端 ${task.clientId}, 进度: ${progress.progress.percentage}%`);
   if (results) {
    this.wsGateway.sendProgress(task.id, progress,results);
    return;
   }
    this.wsGateway.sendProgress(task.id, progress);
  }


  getTask(taskId: string): Task | undefined {
    const task = this.tasks.get(taskId);
    if (task) {
      this.logger.debug(`获取任务 ${taskId} 信息成功`);
    } else {
      this.logger.warn(`获取任务 ${taskId} 信息失败，任务不存在`);
    }
    return task;
  }
}
