import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import {summarizeCollectionStream} from "../common/Ai/tag"

@Injectable()
export class UserFavoriteService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private httpService: HttpService,
  ) {}
  // Fisher-Yates 洗牌算法
  private shuffleArray(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
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
  async GetUserFavorite(Id){
    return await this.prisma.userFavorite.findUnique({
      where:{
        id:Id
      },
      include:{
        primaryUser:true,
        card:true
      }
    })
  }
  async GetUserAll(userID){
    const data= this.prisma.userFavorite.findMany({
      where:{
        primaryUserId:userID
      },
      include:{
        card:true,
        primaryUser:true
      }
    })
      return data
  
  }


  //获取所有的收藏夹ID（分页）
  async GetAllFavoriteId(userID) {
    const favorites = await this.prisma.userFavorite.findMany({
      where: {
        primaryUserId: userID,
      },
      select: {
        id: true,
        title: true,
      },
      orderBy: {
        createdAt: 'desc' // 按创建时间降序排序
      }
    });

    return {
      data: favorites,
    };
  }
  //对收藏夹打tag
async SetFavoriteTag(id: string) {
  // 查找指定ID的收藏夹
  const favorite = await this.prisma.userFavorite.findUnique({
    where: {
      id: id,
    },
    select: {
      card: true,
    }
  });

  // 如果找到收藏夹
  if (!favorite) {
    throw new BadRequestException('收藏夹不存在');
  }

  // 处理卡片数据
  const processedCards = favorite.card.map(card => ({
    ...card,
    tags: JSON.stringify(card.tags)
  }));

  try {
    // 使用AI进行标签总结
    const summary = await summarizeCollectionStream(JSON.stringify(processedCards));
    return summary;
  } catch (error) {
    throw new BadRequestException('标签生成失败');
  }
}
  async GetUserFirstFavorite(userId){
    const data=await this.prisma.userFavorite.findFirst({
       where:{
         primaryUserId:userId
       },
       include:{
        card:true
       }
    })
    if (data) {
      return {
        message:"成功",
        data
      }
    }else{
      return {
        message:"没有默认收藏夹",
        data:null
      }
    }
  }

  //获取随机的收藏夹
  //每个收藏夹至少含还有两个card
  async  GetRandomFavorite(): Promise<any[]> {
    try {
      // Step 1: 查询符合条件的收藏夹（至少包含两个 card）
      const favorites = await this.prisma.userFavorite.findMany({
        where: {
          card: {
            some: {}, // 至少有一个关联的 card
          },
        },
        include: {
          card: true, // 包含关联的 card 数据
        },
      });
      // Step 2: 过滤出至少有两个 card 的收藏夹
      const validFavorites = favorites.filter((fav) => fav.card.length >= 2);
      // Step 3: 随机打乱顺序
      const shuffledFavorites = this.shuffleArray(validFavorites);
      // Step 4: 返回随机结果（例如取前 5 个）
      return shuffledFavorites.slice(0, 5);
    } catch (error) {
      console.error('Error fetching random favorites:', error);
      throw error;
    }
  }
  
  
  //分页获取收藏夹
  async  GetFavoritesByPage(
    page: number, // 当前页码（从 1 开始）
    pageSize: number, // 每页大小
    sortBy: 'createdAt' | 'name' = 'createdAt', // 排序字段，默认按创建时间排序
    sortOrder: 'asc' | 'desc' = 'desc' // 排序方向，默认降序
  ): Promise<any[]> {
    try {
      // Step 1: 计算 skip 值
      const skip = (page - 1) * pageSize;
  
      // Step 2: 查询符合条件的收藏夹（至少包含两个 card）
      const favorites = await this.prisma.userFavorite.findMany({
        where: {
          card: {
            some: {}, // 至少有一个关联的 card
          },
        },
        include: {
          card: true, // 包含关联的 card 数据
        },
        orderBy: {
          [sortBy]: sortOrder, // 按指定字段排序
        },
        skip: skip, // 跳过前面的记录
        take: pageSize, // 每页返回的记录数
      });
      // Step 3: 过滤出至少有两个 card 的收藏夹
      const validFavorites = favorites.filter((fav) => fav.card.length >= 1);
      return validFavorites;
    } catch (error) {
      console.error('Error fetching paginated favorites:', error);
      throw error;
    }
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

  //添加权限用户
  async PushFavoriteUser({userFavoriteID,userID}:{userFavoriteID:string,userID:string}){
  return await this.prisma.userFavorite.update({
    where:{
      id:userFavoriteID
    },
    data:{
      secondaryUsers:{
        connect:{
          id:userID
        }
      }
    },
    include: {
      secondaryUsers: true, // 返回更新后的 secondaryUsers
    },
  })  
 }


}
