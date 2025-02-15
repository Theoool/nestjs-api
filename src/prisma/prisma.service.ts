import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { SearchService } from '../search/search.service';

import { SearchCollection } from 'src/search/interfaces/typesense-card.interface';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(private readonly searchService: SearchService) {
    super();
    
  
  }

  async onModuleInit() {
    console.log('Connecting to database with URL:', process.env.DATABASE_URL);
    await this.$connect();
  }

  private async handleCardSync(action: string, result: any, where?: any) {
    switch (action) {
      case 'create':
        await this.searchService.upsertCard(this.transformCard(result));
        break;
      case 'update':
        if (result) {
          await this.searchService.upsertCard(this.transformCard(result));
        }
        break;
      case 'delete':
        await this.searchService.deleteCard(where?.id);
        break;
      case 'deleteMany':
        const ids = where?.id?.in || [];
        await this.searchService.bulkDeleteCards(ids);
        break;
    }
  }

  private transformCard(card: any): SearchCollection {
    return {
      id: card.id,
      title: card.title,
      content: card.content,
      author_id: card.authorId,      //# 关联用户ID
             //# 需额外统计收藏数
      created_at: Math.floor(card.createdAt.getTime() / 1000),
      
    };
  }
}
