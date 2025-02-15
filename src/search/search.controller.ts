import { Controller, Get, Query, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SearchCardDto } from './dto/search-card.dto';
import { SearchService } from './search.service';

@ApiTags('搜索')
@Controller('search/cards')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @ApiOperation({ summary: '测试连接' })
  @Get('test')
  async test() {

     await this.searchService.initCollection()
    // 添加测试数据
    await this.searchService.upsertCard({
      id: 'test-1',
      title: '测试公众号文章',
      content: '这是一篇测试公众号文章的内容',
      author_id: 'cm52gdrq80000sd5zx597y4wl',
      created_at: Date.now(),
    });

    // 测试搜索
    return this.searchService.searchCards({
      query: '测试',
      page: 1,
      perPage: 10
    });
  }

  @ApiOperation({ summary: '搜索卡片' })
  @Get()
  async search(@Query() params: SearchCardDto) {
     await this.searchService.initCollection()
    try {
      const result = await this.searchService.searchCards({
        query: params.query || '*',
        authorId: params.authorId,
        page: params.page || 1,
        perPage: params.perPage || 20,
      });
      return result;
    } catch (error) {
      console.error('搜索请求失败:', error);
      throw error;
    }
  }
  
  @ApiOperation({ summary: '获取所有文档' })
  @Get('all')
  async getAllDocuments() {
    return this.searchService.getAllDocuments();
  }

  @ApiOperation({ summary: '获取集合信息' })
  @Get('collection-info')
  async getCollectionInfo() {
    return this.searchService.getCollectionInfo();
  }
}
