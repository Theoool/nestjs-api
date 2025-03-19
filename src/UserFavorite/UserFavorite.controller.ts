import { Body, Controller, Post, Get, Param, UseGuards, Put, Delete, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { UserFavoriteService } from './UserFavorite.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UserFavoriteDto } from './dto/UserFavorite.dto';
import { CurrentUser } from 'src/auth/auth.decorator';
@ApiTags('UserFavorites')
@Controller('UserFavorites')


export class UserFavoriteController {
  constructor(private UserFavoriteService: UserFavoriteService) { }
  @Post('createFavorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: '创建用户收藏' })  // 添加API描述
  @ApiBody({
    type: UserFavoriteDto,
    examples: {

      example1: {
        summary: '合集示例',
        description: '创建一个新的合集',
        value: {
          "title": "第一个合集",
          "content": "第一个合集"
        }
      }
    }
  })      // 添加请求体说明
  async createFavorite(
    @Body() data: UserFavoriteDto,
    @CurrentUser() user: any
  ) {
    console.log(data);
    
    return this.UserFavoriteService.createFavorite(data, user.sub);
  }
  
  @Get('tag/:id')
  async tagai(@Param('id') id: string) {
    return this.UserFavoriteService.SetFavoriteTag(id)
  }

  @ApiOperation({ summary: '获取所有的公开的收藏夹' })
  @Get("GetAllFavoriteId")
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: '成功返回收藏夹列表及分页信息' })
  async GetAllFavoriteId(@CurrentUser() user: any) {
    return await this.UserFavoriteService.GetAllFavoriteId(user.sub);
  }

  @ApiOperation({ summary: '添加参与者' })
  @Get("PushUser")
  async GetFavoriteUser(@Body() data: { userFavoriteID: string, userID: string }) {
    return await this.UserFavoriteService.PushFavoriteUser(data)
  }
  @Get('/FirstFavorite')
  @ApiOperation({ summary: '获取用户的第一个收藏夹' })
  @ApiResponse({ status: 200, description: '成功返回收藏夹信息' })
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 404, description: '没有默认收藏夹' })
  // @ApiParam({ name: 'userId', type: 'string', description: '用户 ID' })
  async getUserFirstFavorite(@CurrentUser() user: any) {
    return this.UserFavoriteService.GetUserFirstFavorite(user.sub);
  }

  @Get('/random')
  @ApiOperation({ summary: '获取随机的收藏夹' })
  @ApiResponse({ status: 200, description: '成功返回随机收藏夹列表' })
  async getRandomFavorites() {
    return this.UserFavoriteService.GetRandomFavorite();
  }
  @Get('/paginate')
  @ApiOperation({ summary: '分页获取收藏夹' })
  @ApiResponse({ status: 200, description: '成功返回分页收藏夹列表' })
  @ApiQuery({ name: 'page', type: 'number', description: '页码（从 1 开始）' })
  @ApiQuery({ name: 'pageSize', type: 'number', description: '每页大小' })
  @ApiQuery({ name: 'sortBy', enum: ['createdAt', 'name'], required: false, description: '排序字段' })
  @ApiQuery({ name: 'sortOrder', enum: ['asc', 'desc'], required: false, description: '排序方向' })
  async getFavoritesByPage(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('sortBy') sortBy: 'createdAt' | 'name' = 'createdAt',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    return this.UserFavoriteService.GetFavoritesByPage(page, pageSize, sortBy, sortOrder);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除收藏夹' })
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiParam({ name: 'id', type: 'string', description: '收藏夹 ID' })
  async deleteFavorite(@Param('id') id: string) {
    return this.UserFavoriteService.deleteFavorite(id);
  }
  
  @Get('GetUserFavorite/:id')
  async GetFavorite(@Param('id') id: string) {
    return this.UserFavoriteService.GetUserFavorite(id);
  }

  @Put('/:id')
  @ApiOperation({ summary: '更新收藏夹' })
  @ApiResponse({ status: 200, description: '成功返回更新后的收藏夹信息' })
  @ApiParam({ name: 'id', type: 'string', description: '收藏夹 ID' })
  async updateFavorite(@Param('id') id: string, @Body() data: any) {
    return this.UserFavoriteService.UpdateFavorite(id, data);
  }
  @Post('/push-user')
  @ApiOperation({ summary: '添加权限用户到收藏夹' })
  @ApiResponse({ status: 200, description: '成功返回更新后的收藏夹信息' })
  async pushFavoriteUser(@Body() body: { userFavoriteID: string; userID: string }) {
    return this.UserFavoriteService.PushFavoriteUser(body);
  }
  @Get('/getuserall')
  @UseGuards(JwtAuthGuard)
  async GetUserAll(@CurrentUser() user: any) {

    return this.UserFavoriteService.GetUserAll(user.sub);
  }
}

