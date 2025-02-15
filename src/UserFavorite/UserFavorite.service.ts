import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import {tagAI} from "../common/Ai/tag"

@Injectable()
export class UserFavoriteService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private httpService: HttpService,
  ) {}
  async createFavorite(data,userId:any){ 
    console.log(data,userId);
    
    const res= await this.prisma.userFavorite.create({
      data:{...data,
        primaryUserId:userId,
        secondaryUserId:userId}
    })
    if (res) {
      return {
        message:"成功",
        data:res
      }
    }
  }
  //获取所有的收藏夹ID
  async GetAllFavoriteId(){
    return await this.prisma.userFavorite.findMany({
      select:{
        id:true
      }
    })
  }
  //对收藏夹打tag
  async SetFavvoriteTag(id){
    const data=await this.prisma.userFavorite.findFirst({
     where:{
      id,
     } ,
     select:{
      card:true,
      // id:true
     }
    })
    let str=''
    data.card.map(ele=>{
     str+="["+JSON.stringify(ele)+']'
    })
    
     return await tagAI(str)
    
  }
  //删除收藏夹
  async deleteFavorite(id){
    return await this.prisma.userFavorite.delete({
      where:id,
    })
    
  }
  //更新收藏夹
  async UpdateFavorite(id,data){
    return await this.prisma.userFavorite.update({
      where:{
        id
      },
      data
    })
  }
  //获取所有收藏夹id
  async GetFavoriteRouter(){
    return this.prisma.userFavorite.findMany({
      select:{
        id:true
      }
    })
  }


}
