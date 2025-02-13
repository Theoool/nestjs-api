import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service'; 
import {JwtAuthGuard} from '../auth/guards/jwt-auth.guard'
import { ApiBody, ApiTags } from '@nestjs/swagger';
import {SignupInput} from './dto/signup.dto'
import {SigninInput} from './dto/signin.dto'
// import { AuthGuard } from '@nestjs/passport';
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {
  }
 
  @Post('signup')
  signup(@Body() auth: SignupInput) {
    return this.authService.signup(auth)
  }  
  @UseGuards(JwtAuthGuard)
  @Get('user')
  getUser() {
    return this.authService.getUser()
  }
  @Post('signin')
  signin(@Body() auth: SigninInput) {  // 临时改为 any 类型来调试
   
    try {
      // 尝试手动解析 body
      const parsedBody = auth
      const email = parsedBody.email;
      const password = parsedBody.password;
      const rememberMe = parsedBody.rememberMe;
      return this.authService.signin(email, password, rememberMe);
    } catch (error) {
    
      throw error;
    }
  }
}

