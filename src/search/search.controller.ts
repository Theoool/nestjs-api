import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { Response } from 'express';
import  { parseSeoAi } from '../common/Ai/seo'
import  { getCoverAnalysis } from '../common/Ai/Cover'
import  { processFile } from '../common/Ai/Html'
import { Readable } from 'stream';
import crawlXiaohongshu from 'src/common/Ai/Xiaohushu';
import { OpentAiOptions ,model} from 'src/common/setting';
import { AiConfigMiddleware } from 'src/common/middleware/ai-config.middleware';
import { fetchWebpage, parseWebPageForAI } from 'src/common';
import { AdvancedSearchQueryDto } from './dto/AdvancedSearchQuery';

interface AdvancedSearchQuery {
  query?: string;
  title?: string;
  tags?: string[];
  startDate?: string;
  endDate?: string;
  authorId?: string;
  page?: number;
  perPage?: number;
  sortBy?: 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

@ApiTags('搜索')
@Controller('search/cards')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}
  @ApiOperation({ summary: '高级搜索' })
  @Get('advanced')
  async advancedSearch(@Query() params: AdvancedSearchQueryDto) {
    try {
      // 参数预处理
      const processedParams = {
        ...params,
        page: params.page ? Number(params.page) : 1,
        perPage: params.perPage ? Number(params.perPage) : 20,
        tags: params.tags ? (typeof params.tags === 'string' ? (params.tags as string).split(',').map(tag => tag.trim()) : params.tags) : undefined,
        startDate: params.startDate ? new Date(params.startDate).toISOString() : undefined,
        endDate: params.endDate ? new Date(params.endDate).toISOString() : undefined
      };
      // 参数验证
      if (processedParams.page < 1) processedParams.page = 1;
      if (processedParams.perPage < 1) processedParams.perPage = 20;
      if (processedParams.perPage > 100) processedParams.perPage = 100;
      return await this.searchService.advancedSearch({
        query:params.query,
        page:1,
        perPage:20,
        sortBy:"createdAt",
        sortOrder:"desc"
      });
    } catch (error) {
      console.error('高级搜索失败:', error);
      throw error;
    }
  }

  @ApiOperation({ summary: '语义搜索' })
  @Get('semantic')
  async semanticSearch(
    @Query('query') query: string,
    // @Query('topK') topK: number = 5,
    // @Query('minScore') minScore: number = 0.2
  ) {
    try {
      return await this.searchService.semanticSearch(query, 5, .2);
    } catch (error) {
      console.error('语义搜索失败:', error);
      throw error;
    }
  }

  @ApiOperation({ summary: 'SEO分析' })
  
  @Get("parse-md")
  async parseSeodown(
    @Query("url") url: string, 
    @Query("role") role: string = 'contentMarketing',
    @Res() res: Response,
    @Req() req:Request
  ) {
    try {
      const aiConfig = req['aiConfig'];
      const webStream = await parseSeoAi(url, role,{
        modelName:aiConfig.modelName,
        openAIApiKey: aiConfig.openAIApiKey,
        baseURL: aiConfig.baseURL});
      // 设置响应头为纯文本内容类型
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Transfer-Encoding", "chunked");
      webStream.pipe(res);
      webStream.on('data', chunk => console.log('Stream data:', chunk.toString()));
      // 添加流关闭处理
      webStream.on('end', () => res.end());
      webStream.on('error', (err) => {
        console.error('流错误:', err);
        res.status(500).end();
      });
  
    } catch (error) {
      // 返回标准化的错误流
      const errorStream = new ReadableStream({
        start(controller) {
          controller.enqueue("错误：服务暂时不可用，请稍后再试。");
          controller.close();
        }
      });
      Readable.fromWeb(errorStream).pipe(res.status(500));
    }
  }
  @ApiOperation({ summary: 'Cover' })
  @Get("Cover")
  async Cover(
    @Query("url") url: string, 
    @Query("role") role: string = 'contentMarketing',
    @Req() req: Request
  ) {
    try {
      if (!url) {
        return {
          success: false,
          message: '请提供有效的URL'
        };
      }
      const aiConfig = req['aiConfig'];
     
      const Cover = await getCoverAnalysis(url, role,{
        modelName:aiConfig.modelName,
        openAIApiKey: aiConfig.openAIApiKey,
        baseURL: aiConfig.baseURL});
      return {
        success: true,
        data: Cover
      };
    } catch (error) {
      console.error('Cover分析失败:', error);
      return {
        success: false,
        message: '封面生成失败，请稍后重试',
        error: error.message
      };
    }
  }
  @ApiOperation({ summary: 'Htmlcode' })
  @Post("Htmlcode")
  async Htmlcode(
    @Body() body:any,
    @Req() req: Request
) {
  const { url,text } = body;
  const aiConfig = req['aiConfig'];
    try {
      if (!text) {
        return {
          success: false,
          message: '请提供有效的文件内容'
        };
      }
    let textdata
    if (url) {
       textdata = await fetchWebpage(url)
    }
      const data = await processFile(text||textdata.sections,{
        modelName:aiConfig.modelName,
        openAIApiKey: aiConfig.openAIApiKey,
        baseURL: aiConfig.baseURL});
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('生成失败:', error);
      return {
        success: false,
        message: 'html生成失败，请稍后重试',
        error: error.message
      };
    }
  }
  @Post('meta')
  @ApiOperation({ summary: '获取网页信息' })  // 添加API描述
  async postCardmeta(
    @Body() data:{url:string}, 
    @Req() req: Request
    
   ) {
    const aiConfig = req['aiConfig'];
    return await  parseWebPageForAI(data.url,{
      modelName:aiConfig.modelName,
      openAIApiKey: aiConfig.openAIApiKey,
      baseURL: aiConfig.baseURL});
  }
  @ApiOperation({ summary: '更新类型' })
  @Get("aaa")
  async ccc() {
    this.searchService.initCollection()
  }
 



  @ApiOperation({ summary: '搜索卡片' })
  @Get()
  async search() {  
    try {
      const result = await this.searchService.semanticSearch("编程，学习，教程");
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

  @ApiOperation({ summary: '测试所有文档' })
  @Get('all-test')
  async getDocuments() {
    // return this.searchService.initCollection();
  }

  @ApiOperation({ summary: '获取集合信息' })
  @Get('collection-info')
  async getCollectionInfo() {
    return this.searchService.getCollectionInfo();
  }
  @Get('XIAO')
  async X() {
    return crawlXiaohongshu('https://www.xiaohongshu.com/explore/67c698fd000000001203fdc8?xsec_token=ABKprItK9P4GxiaKN_n1q3qQ5KEgCxMen5RfnOA-AxxmE=&xsec_source=pc_feed')
    // return this.searchService.getCollectionInfo();
  }
}
