import { Body, Controller, Post,Get, Param, UseGuards, Put, Delete, Query } from '@nestjs/common';
import { cardService } from './card.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CreateCardDto } from './dto/create-card.dto';
import { CurrentUser } from 'src/auth/auth.decorator';
import {SearchService} from '../search/search.service'
import { PageQueryDto } from './dto/page-query.dto';
import {fetchWebpage} from '../common/index'

@ApiTags('Card')
@Controller('Card')

export class cardController {
  constructor(private  cardService: cardService,private SearchService:SearchService) {}

@Post()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
@ApiOperation({ summary: '创建卡片' })  // 添加API描述
 // 添加请求体说明
@ApiBody({
    type: CreateCardDto,
    description: '创建卡片的请求数据',
    examples: {
      example1: {
        summary: '创建卡片示例',
        description: '创建一个新的卡片',
        value: {
            
                "UserFavoriteId": "cm73n6r7j0001xz27pj6o7wxs",
              "image":"https://lf-web-assets.juejin.cn/obj/juejin-web/xitu_juejin_web/static/favicons/apple-touch-icon.png",
              "tags":[],
                "title": "十分钟入门prisma",
                "url": "https://juejin.cn/post/7231152303583100988#heading-10",
                "content": "本文介绍了如何在 Koa 中使用 Prisma 配合 MySQL 数据库实现数据的增删改查。包括安装依赖、初始化环境、初始化 Prisma、生成 Prisma Client 及 CRUD 操作的实现和注意事项，并总结了 Prisma 的基本使用流程"
              
        }
      }
    }
  })
async CreateCard(
    @Body() createCardDto: CreateCardDto,
    @CurrentUser() user: any
) {   
      const card= await this.cardService.createcard(createCardDto,user.sub)
      return card
}
@Get()
@ApiOperation({ summary: '获取卡片' })  
async getCard() {
    return await this.cardService.getcard()
}
@Get("GetOneCard/:id")
@ApiOperation({ summary: '获取卡片' }) 
async GetOneCard(@Param('id') id: string,) {
    return await this.cardService.GetOnecard(id)
}




@Post('updata/:id')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
@ApiOperation({ summary: '更新卡片' })  // 添加API描述
async updateCard(@Param('id') id: string, @Body() data) {
    return await this.cardService.updatecard(id, data)
}
//获取最新的卡片
@Get("new")
@ApiOperation({ summary: '获取最新卡片列表' })
// @ApiQuery({ type: PageQueryDto })
async getNewCard(@Query() query: PageQueryDto) {
  return await this.cardService.getNewCard(query)
}
@Post('delete/:id')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
@ApiOperation({ summary: '删除卡片' })  // 添加API描述
async deleteCard(@Param('id') id: string) {
    return await this.cardService.deletecard(id)
}
@Post('SaveCards')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
@ApiOperation({ summary: '批量保存卡片' })
async SaveCards(@Body() {url,UserFavoriteId}:{url:string[],UserFavoriteId:string}, @CurrentUser() user: any) {
  try {
    const batchSize = 5;
    const results = [];
    const failedUrls = [];
    let successCount = 0;
    let failedCount = 0;
    for (let i = 0; i < url.length; i += batchSize) {
      const batch = url.slice(i, i + batchSize);
      
      const batchResults = await Promise.all(
        batch.map(async (e) => {
          try {
            const { meta } = await fetchWebpage(e);
            const card = await this.cardService.createcard({
              url: e,
              title: meta.title || "",
              image: meta.image || "",
              tags: meta.keywords ? meta.keywords.split(",") : [meta.title],
              content: meta.description || "",
              UserFavoriteId: UserFavoriteId
            }, user.sub);
            
            successCount++;
            return { success: true, url: e, card };
          } catch (error) {
            failedCount++;
            failedUrls.push({
              url: e,
              error: error.message || '未知错误'
            });
            return { success: false, url: e, error: error.message };
          }
        })
      );
      
      results.push(...batchResults);
    }
    
    return {
      success: true,
      stats: {
        total: url.length,
        successCount,
        failedCount,
        successRate: `${((successCount / url.length) * 100).toFixed(2)}%`
      },  
      results: results.filter(r => r.success),
      failures: failedUrls
    };
  } catch (error) {
    console.error('批量保存卡片时发生错误:', error);
    throw new Error('批量保存卡片失败');
  }
}
//保存卡片
@Get('NomCard')
// @UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
async GetNomCard(@Query() url: any) {
    try {
      const { meta } = await fetchWebpage(url.url);
      return {meta:meta}
    }catch (error) {
        console.error('加载卡片时发生错误:', error);
        return {
            success: false,
            error: error.message || '加载卡片时发生错误'
        };
    }
  }
}

