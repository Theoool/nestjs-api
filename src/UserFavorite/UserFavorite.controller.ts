import { Body, Controller, Post,Get, Param, UseGuards, Put, Delete } from '@nestjs/common';
import { UserFavoriteService } from './UserFavorite.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { UserFavoriteDto } from './dto/UserFavorite.dto';
import { CurrentUser } from 'src/auth/auth.decorator';
@ApiTags('UserFavorites')
@Controller('UserFavorites')


export class UserFavoriteController {
  constructor(private  UserFavoriteService: UserFavoriteService) {}
@Post ()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
@ApiOperation({ summary: '创建用户收藏' })  // 添加API描述
@ApiBody({ type: UserFavoriteDto,
  examples: {
    
    example1:{
      summary: '合集示例',
      description: '创建一个新的合集',
      value:{
        "title":"第一个合集",
  "content":"第一个合集"
      }
  }
 }})      // 添加请求体说明
async createFavorite(
    @Body() data: UserFavoriteDto,
    @CurrentUser() user: any
) {
  
    return this.UserFavoriteService.createFavorite(data, user.sub);
}
@Get('tag')
async tagai(){
  return this.UserFavoriteService.SetFavvoriteTag('cm53b1owg0005i5dfsng32rln')
}
@Put("Update")
async updateFavorite(@Param('id') id: string, @Body() data: UserFavoriteDto) {
    return this.UserFavoriteService.UpdateFavorite(id, data);
}
@Delete()
async deleteFavorite(@Param('id') id: string) {
    return this.UserFavoriteService.deleteFavorite(id);
}
@Get("router")
  async GetFavoriteRouter(){
    return await  this.UserFavoriteService.GetFavoriteRouter()
  }

}

