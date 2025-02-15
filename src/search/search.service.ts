// src/search/search.service.ts
import { Injectable, Inject } from '@nestjs/common';
import Typesense from 'typesense';
import { SearchCollection } from './interfaces/typesense-card.interface';
import { SearchCardDto } from './dto/search-card.dto';

@Injectable()
export class SearchService {
  constructor(
    @Inject('TYPESENSE_CLIENT') private readonly client: any,
  ) {}

  async initCollection() {
    try {
      // 尝试删除已存在的集合
      try {
        await this.client.collections('cards').delete();
        console.log('已删除旧的 cards 集合');
      } catch (e) {
        console.log('cards 集合不存在或删除失败:', e.message);
      }

      // 创建新集合，只保留必要字段
      const schema = {
        name: 'cards',
        fields: [
          { name: 'id', type: 'string' },
          { name: 'title', type: 'string', sort: true },
          { name: 'content', type: 'string' },
          { name: 'author_id', type: 'string', facet: true },
          { name: 'created_at', type: 'int64', sort: true }
        ],
        default_sorting_field: 'created_at'
      };

      const newCollection = await this.client.collections().create(schema);
      console.log('成功创建新集合:', newCollection);

      // 添加测试数据
      await this.addInitialTestData();

    } catch (error) {
      console.error('初始化集合失败:', error);
      throw error;
    }
  }
  async addInitialTestData() {
    const testDocuments = [
      {
        id: 'test-1',
        title: '测试文章 1',
        content: '这是第一篇测试文章的内容',
        author_id: 'author1',
        created_at: Date.now()
      },
      {
        id: 'test-2',
        title: '测试文章 2',
        content: '这是第二篇测试文章的内容',
        author_id: 'author2',
        created_at: Date.now()
      },
      {
        id: 'test-3',
        title: '公众号运营技巧',
        content: '这是一篇关于公众号运营的文章，包含了很多实用技巧',
        author_id: 'author1',
        created_at: Date.now()
      }
    ];

    try {
      for (const doc of testDocuments) {
        await this.client.collections('cards').documents().create(doc);
        console.log(`成功添加文档: ${doc.id}`);
      }
      console.log('测试数据添加完成');
    } catch (error) {
      console.error('添加测试数据失败:', error);
      throw error;
    }
  }

  async searchCards(params: SearchCardDto) {
    const filters = [];
    if (params.authorId) filters.push(`author_id: ${params.authorId}`);

    return this.client.collections('cards').documents().search({
      q: params.query,
      query_by: 'title,content',
      filter_by: filters.join(' && '),
      page: params.page,
      per_page: params.perPage || 20,
      highlight_full_fields: 'title,content',
      snippet_threshold: 200,
    });
  }

  async upsertCard(card: SearchCollection) {
    return this.client.collections('cards').documents().upsert(card);
  }

  async bulkUpsertCards(cards: SearchCollection[]) {
    await this.client.add('bulk-upsert', cards, {
      attempts: 3,
      backoff: 5000,
    });
    // Worker处理
this.client.process('bulk-upsert', async (job) => {
  return this.client.collections('cards').documents().import(job.data, {
    action: 'upsert',
    batch_size: 50 // 优化批量大小
  });
});

  }
  async deleteCard(id: string) {
    return this.client.collections('cards').documents().delete(id);
  }
  async bulkDeleteCards(ids: string[]) {
    return this.client.collections('cards').documents().delete(ids);
  }
  async getAllDocuments() {
    try {
      // 使用空查询 '*' 来获取所有文档
      const searchResults = await this.client.collections('cards')
        .documents()
        .search({
          q: '*',
          query_by: 'title',
          per_page: 100,  // 设置一个较大的数值
        });
      
      console.log(`找到 ${searchResults.found} 条文档`);
      return searchResults;
    } catch (error) {
      console.error('获取所有文档失败:', error);
      throw error;
    }
  }

  async getCollectionInfo() {
    try {
      const collectionInfo = await this.client.collections('cards').retrieve();
      return {
        name: collectionInfo.name,
        num_documents: collectionInfo.num_documents,
        fields: collectionInfo.fields,
        created_at: collectionInfo.created_at
      };
    } catch (error) {
      console.error('获取集合信息失败:', error);
      throw error;
    }
  }
}
