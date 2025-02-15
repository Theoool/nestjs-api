import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service'; 
import {JwtAuthGuard} from '../auth/guards/jwt-auth.guard'
import { ApiBody, ApiTags,ApiResponse,ApiOperation ,ApiBearerAuth} from '@nestjs/swagger';
import {SignupInput} from './dto/signup.dto'
import {SigninInput} from './dto/signin.dto'
// ... existing code ...

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
 
  @Post('signup')
  @ApiOperation({ summary: '用户注册' })
  @ApiBody({ type: SignupInput })
  @ApiResponse({ status: 201, description: '注册成功' })
  @ApiResponse({ status: 400, description: '注册失败' })
  signup(@Body() auth: SignupInput) {
    return this.authService.signup(auth)
  }  

  @UseGuards(JwtAuthGuard)
  @Get('user')
  @ApiOperation({ summary: '获取用户信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth()
  getUser() {
    return this.authService.getUser()
  }

  @Post('signin')
  @ApiOperation({ summary: '用户登录' })
  @ApiBody({ type: SigninInput,
    examples: {
      example1: {
        summary: '用户',
      
        value:{
          email:"2580456922@qq.com",
          password:"12345678",
          rememberMe:true
        }
      }
    }
   })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 401, description: '登录失败' })
  signin(@Body() auth: SigninInput) {
    return this.authService.signin(auth.email, auth.password, auth.rememberMe);
  }
}
