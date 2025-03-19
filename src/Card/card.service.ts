import { BadRequestException, ConflictException, Inject, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CreateCardDto } from './dto/create-card.dto';
import {parseWebPageForAI} from '../common';
import { SearchService } from 'src/search/search.service';
import {getEmbedding} from '../common/Ai/embedding'
import { PageQueryDto } from './dto/page-query.dto';

@Injectable()
export class cardService {
  constructor(
    private prisma: PrismaService,
    private searchService: SearchService,
  ) {}

 
  async createcard(data:CreateCardDto,ID:string) {
    console.log(data,ID);
    
    try {
      const {content, title, tags, url, UserFavoriteId, image}=data
      let Embedding= await getEmbedding(`${data.tags},${data.title},${data.url}`)
      const result= await this.prisma.card.create({
        data:{
          Embedding,
          content,
          title,
          tags,
          url,
          UserFavoriteId,
          image:image||'',
          authorId:ID
        },
      })
      console.log(result);
      
      if (result) {
        this.searchService.CreateCard(result)
      }
      return result;
    } catch (error) {
      throw new InternalServerErrorException('数据库操作失败',error);
    }
  }

  async getcard(){
    let res = await this.prisma.card.findMany();
    if (res) {
      await Promise.all(
        res.map(async (item) => {
          await this.searchService.CreateCard(item);
        })
      );
    }
    return res;
  }

  async GetOnecard(id){
    let res = await this.prisma.card.findFirst({
      where:{
        id
      }
    });
    return res;
  }

  async updatecard(id: string, data: CreateCardDto) {
    const card= await this.prisma.card.update({
      where: { id },
      data,
    });
    await this.searchService.upsertCard(card)
    return {
      data: card,
    }
  }
  
  async deletecard(id: string) {
    await this.prisma.card.delete({
      where: { id },
    });
    await this.searchService.deleteCard(id)
  }

  async getNewCard(query: PageQueryDto) {
    try {
      const { page, pageSize, orderBy, order } = query;
      const skip = (page - 1) * pageSize;
      
      // 先获取去重后的卡片总数
      const distinctCardsCount = await this.prisma.card.findMany({
        distinct: ['title', 'url'],
        select: { id: true }
      });
      
      const total = distinctCardsCount.length;
      
      // 获取去重后的卡片数据
      const cards = await this.prisma.card.findMany({
        distinct: ['title', 'url'],
        take: pageSize,
        skip,
        orderBy: {
          [orderBy]: order,
        },
        include: {
          author: {
            select: {
              username: true,
              image: true
            }
          }
        }
      });

      const hasMore = total > (page * pageSize);

      return {
        data: cards,
        meta: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
          hasMore
        }
      };
    } catch (error) {
      throw new InternalServerErrorException('获取卡片列表失败');
    }
  }
}
