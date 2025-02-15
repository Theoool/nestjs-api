import { BadRequestException, ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CreateCardDto } from './dto/create-card.dto';
import {parseWebPageForAI} from '../common';


@Injectable()
export class cardService {
  constructor(
    @Inject('TYPESENSE_CLIENT') 
    private prisma: PrismaService,
    
  ) {}
  async Postcard(url: string): Promise<any> {
        const data = await parseWebPageForAI(url);;
        return data;
  }


   createcard(data:CreateCardDto,ID:string) {
    const {content,title,tags,url,UserFavoriteId,image}=data
    return  this.prisma.card.create({
      data:{
        content,title,tags,url,UserFavoriteId,image,authorId:ID
      }
    })
  }

  async getCard(id: string) {

    return this.prisma.card
    
    // return await this.prisma.card.findUnique({
    //   where: {
    //     id,
        
    //   },
    // });
  }
  async updatecard(id: string, data: CreateCardDto) {
    return await this.prisma.card.update({
      where: { id },
      data,
    });
  }
  
  async deletecard(id: string) {
    return await this.prisma.card.delete({
      where: { id },
    });
  }
 async getALLcard(){
  return "你好啊"
  return await this.prisma.card.findFirst({
     where:{
      id:'12dsaas'
     }
  })
 }
  
}
