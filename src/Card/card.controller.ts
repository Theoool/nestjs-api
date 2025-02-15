import { Body, Controller, Post,Get, Param, UseGuards, Put, Delete, Query } from '@nestjs/common';
import { cardService } from './card.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CreateCardDto } from './dto/create-card.dto';
import { CurrentUser } from 'src/auth/auth.decorator';

@ApiTags('Card')
@Controller('Card')

export class cardController {
  constructor(private  cardService: cardService) {}
@Get(':url')
@ApiOperation({ summary: '获取网页信息' })  // 添加API描述
async postCardmeta(
    @Param('url') url:string, 
) {
    return await this.cardService.Postcard(url)
}
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
    return await this.cardService.createcard(createCardDto,user.sub)
}
@Get('id')
@ApiOperation({ summary: '获取卡片' })  // 添加API描述
async getcards(@Param('id') id: string) {
    return await this.cardService.getCard(id)
}

@Get("all")
async getAllcard() {
  return await this.cardService.getALLcard()
}

@Post('id')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
@ApiOperation({ summary: '更新卡片' })  // 添加API描述
async updateCard(@Param('id') id: string, @Body() createCardDto: CreateCardDto) {
    return await this.cardService.updatecard(id, createCardDto)

}
@Post('id')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
@ApiOperation({ summary: '删除卡片' })  // 添加API描述
async deleteCard(@Param('id') id: string) {
    return await this.cardService.deletecard(id
)
}


}

