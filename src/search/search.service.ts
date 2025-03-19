// src/search/search.service.ts
import { Injectable, Inject } from '@nestjs/common';

import { SearchCollection } from './interfaces/typesense-card.interface';
import { SearchCardDto } from './dto/search-card.dto';
import { getEmbedding } from 'src/common/Ai/embedding';
import { AdvancedSearchQueryDto } from './dto/AdvancedSearchQuery';
import { PrismaService } from 'src/prisma/prisma.service';
interface AdvancedSearchParams {
  query?: string;          // 语义搜索查询
  title?: string;          // 标题搜索
  tags?: string[];         // 标签搜索
  startDate?: string;      // 开始时间
  endDate?: string;        // 结束时间
  authorId?: string;       // 作者ID
  page?: number;           // 页码
  perPage?: number;        // 每页数量
  sortBy?: 'createdAt' | 'title';  // 排序字段
  sortOrder?: 'asc' | 'desc';      // 排序方向
}

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
          { name: 'url', type: 'string' },
          { name: 'image', type: 'string' },
          // 这里修改您需要更新的字段类型
          { 
            name: 'Embedding', 
            type: 'float[]', 
            num_dim: 1024,
            index: true
          },
          { name: 'tags', type: 'string[]', facet: true }, // 例如将 tags 改为 string[] 类型
          { name: 'content', type: 'string' },
          { name: 'authorId', type: 'string', facet: true },
          { name: 'createdAt', type: 'string', sort: true }
        ],
        default_sorting_field: 'createdAt'
      };
      const newCollection = await this.client.collections().create(schema);
     console.log(newCollection);
     
      // 添加测试数据

    } catch (error) {
      console.error('初始化集合失败:', error);
      throw error;
    }
  }
  





  async searchCards(params: SearchCardDto) {
    const filters = [];
    if (params.authorId) filters.push(`authorId: ${params.authorId}`);
    return this.client.collections('cards').documents().search({
      q: params.query,
      query_by: 'title,content,authorId,tags',
      filter_by: filters.join(' && '),
      page: params.page,
      per_page: params.perPage || 20,
      highlight_full_fields: 'title,content,authorId',
      snippet_threshold: 200,
    });
  }

  async upsertCard(card: SearchCollection) {
    return this.client.collections('cards').documents().upsert({tags:JSON.stringify(card.tags),...card});
  }
  async CreateCard(card: SearchCollection) {
    return this.client.collections('cards').documents().create({...card});
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
    return this.client.collections('cards').documents(id).delete();
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
  async semanticSearch(query: string, topK: number = 5, minScore: number = 0.2) {
    // 1. Generate query vector
    const queryVector = await getEmbedding(query);
    const keywordCount = query.split(' ').length;
    const vectorWeight = keywordCount <= 5 ? 0.9 : 0.7; 
    const searchRequests = {
        searches: [{
            collection: 'cards',
            q: query,
            vector_query: `Embedding:([${queryVector}], k:${topK * 2}, weight:${vectorWeight})`,
            query_by: 'title,content,tags',
            per_page: 20,
            include_fields: 'id,title,content,tags,url,image',
            prioritize_exact_match: false,
            prioritize_token_position: false,
        }]
    };

    // 3. Fetch raw results
    const rawResults = await this.client.multiSearch.perform(searchRequests);
    const originalHits = rawResults.results[0].hits || [];

    // 4. Score transformation and filtering
    const filteredHits = originalHits
        .map(hit => {
            const vectorScore = 1 - (hit.vector_distance || 0) / 2; // Normalize vector distance
            const keywordScore = hit.text_match || 0; // Keyword match score
            const hybridScore = vectorWeight * vectorScore + (1 - vectorWeight) * keywordScore; // Dynamic hybrid score
            const similarityTag = vectorScore >= 0.8 ? "高相关" :
                                 vectorScore >= 0.6 ? "中相关" : "低相关";

            return {
                ...hit,
                _score: hybridScore,
                _vector_score: vectorScore,
                _keyword_score: keywordScore,
                similarity_tag: similarityTag
            };
        })
        .filter(hit => hit._vector_score >= minScore) // Enforce semantic relevance
        .sort((a, b) => b._score - a._score) // Sort by hybrid score
        .slice(0, topK); // Return top K results

    // 5. Restructure results
    return {
        ...rawResults.results[0],
        hits: filteredHits,
        found: filteredHits.length,
        search_time_ms: rawResults.results[0].search_time_ms
    };
}
async advancedSearch(params: AdvancedSearchQueryDto) {
  try {
      const {
          query,
          title,
          tags,
          startDate,
          endDate,
          authorId,
          page = 1,
          perPage = 20,
          sortBy = 'createdAt',
          sortOrder = 'desc'
      } = params;

      // Build filter conditions
      const filters = [];
      if (authorId) filters.push(`authorId:=${authorId}`);
      if (tags && tags.length > 0) {
          const tagFilters = tags.map(tag => `tags:=${tag.trim()}`);
          filters.push(`(${tagFilters.join(' || ')})`);
      }
      if (startDate) {
          const formattedStartDate = new Date(startDate).toISOString().split('T')[0];
          filters.push(`createdAt:>=${formattedStartDate}`);
      }
      if (endDate) {
          const formattedEndDate = new Date(endDate).toISOString().split('T')[0];
          filters.push(`createdAt:<=${formattedEndDate}`);
      }
      console.log('Applied filters:', filters);

      // Semantic search with vector query
      if (query) {
          const queryVector = await getEmbedding(query);
          const keywordCount = query.split(' ').length;
          const vectorWeight = keywordCount <= 2 ? 0.9 : 0.7;

          const searchRequests = {
              searches: [{
                  collection: 'cards',
                  q: title || query,
                  vector_query: `Embedding:([${queryVector}], k:${perPage * 2}, weight:${vectorWeight})`,
                  query_by: 'title,content,tags',
                  filter_by: filters.length > 0 ? filters.join(' && ') : undefined,
                  sort_by: `${sortBy}:${sortOrder}`,
                  page: Math.max(1, Number(page)),
                  per_page: Math.min(100, Number(perPage)),
                  include_fields: 'id,title,content,tags,url,image,createdAt,authorId',
                  highlight_fields: 'title,content',
                  facet_by: 'tags,authorId',
                  max_facet_values: 10
              }]
          };

          const rawResults = await this.client.multiSearch.perform(searchRequests);
          const results = rawResults.results[0];

          if (results && results.hits) {
              const enhancedHits = results.hits.map(hit => {
                  const vectorScore = hit.vector_distance ? (1 - hit.vector_distance / 2) : 0;
                  const keywordScore = hit.text_match || 0;
                  const hybridScore = vectorWeight * vectorScore + (1 - vectorWeight) * keywordScore;
                  const similarityTag = vectorScore >= 0.8 ? "高相关" :
                                       vectorScore >= 0.6 ? "中相关" : "低相关";

                  return {
                      ...hit,
                      _score: hybridScore,
                      _vector_score: vectorScore,
                      _keyword_score: keywordScore,
                      similarity_tag: similarityTag
                  };
              });

              return {
                  ...results,
                  hits: enhancedHits,
                  found: results.found,
                  search_time_ms: results.search_time_ms
              };
          }
          return results;
      } else {
          // Standard search without vector query
          const searchParams = {
              q: title || '*',
              query_by: 'title,content,tags',
              filter_by: filters.length > 0 ? filters.join(' && ') : undefined,
              sort_by: `${sortBy}:${sortOrder}`,
              page: Math.max(1, Number(page)),
              per_page: Math.min(100, Number(perPage)),
              include_fields: 'id,title,content,tags,url,image,createdAt,authorId',
              highlight_fields: 'title,content',
              facet_by: 'tags,authorId',
              max_facet_values: 10
          };

          const results = await this.client.collections('cards').documents().search(searchParams);
          return this.processSearchResults(results);
      }
  } catch (error) {
      console.error('Advanced search failed:', error);
      throw error;
  }
}

// Process standard search results
private processSearchResults(results: any) {
  const hits = results.hits.map(hit => {
      const tags = typeof hit.document.tags === 'string' 
          ? JSON.parse(hit.document.tags) 
          : hit.document.tags;

      return {
          ...hit.document,
          tags,
          highlights: hit.highlights,
          vector_score: hit.vector_distance ? (1 - hit.vector_distance / 2) : null,
          text_match_score: hit.text_match || null
      };
  });

  return {
      hits,
      found: results.found,
      page: results.page,
      search_time_ms: results.search_time_ms,
      facets: results.facets
  };
}

}
