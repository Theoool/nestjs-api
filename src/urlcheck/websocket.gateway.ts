// src/websocket/websocket.gateway.ts
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  path: '/ws',
cors: {
    origin: '*', // 根据需求配置
    methods: ['GET', 'POST']
  }
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private clients = new Map<string, Socket>(); // 客户端映射表
  handleConnection(client: Socket) {
    this.clients.set(client.id, client);
    console.log(`客户端连接 ID: ${client.id}`);
    client.data = client.data || {};
   
    client.on('bind-task', (taskClientId: string) => {
      client.data.taskClientId = taskClientId;
      console.log(`任务客户端 ${taskClientId} 绑定到连接 ${client.id}`);
    }); 
  }
  handleDisconnect(client: Socket) {
    this.clients.delete(client.id);
    console.log(`Client disconnected: ${client.id}`);
  }

  // 发送进度更新给特定客户端
    // 发送进度更新给特定客户端
    sendProgress(clientId: string, payload: any,results?: any[]) {
      console.log(`尝试发送进度更新到客户端 ${clientId}，当前连接数: ${this.clients.size}`);
      
      // 支持两种查找方式：直接通过连接ID或通过任务ID
      const client = this.clients.get(clientId) || 
        Array.from(this.clients.values()).find(c => {
          return c.data?.taskClientId === clientId
        });
    
      if (client) {
        try {
          if (results) {
            client.emit('progress', {
              ...payload,
             results,
            },);
          } else {
            client.emit('progress', payload);
          }
        } catch (error) {
          console.error(`发送进度更新失败:`, error);
        }
      } else {
       throw new Error(`未找到客户端 ${clientId}`);
       
      }
    }
  // 广播给所有客户端（可选）           
  broadcastProgress(payload: any) {
    this.server.emit('progress', payload);
  }
  
}
