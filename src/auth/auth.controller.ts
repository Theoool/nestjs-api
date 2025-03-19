import { Body, Controller, Get, Post, UseGuards, Res, BadRequestException, Delete, Param, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { ApiBody, ApiTags, ApiResponse, ApiOperation, } from '@nestjs/swagger';
import { SigninInput } from './dto/signin.dto'
import { CurrentUser } from './auth.decorator';
import { PrismaService } from 'src/prisma/prisma.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService,

    private prisma: PrismaService,

  ) { }

  @Post('signup')
  @ApiOperation({ summary: '用户注册' })
  // @ApiBody({ type: SignupInput })
  @ApiResponse({ status: 201, description: '注册成功' })
  @ApiResponse({ status: 400, description: '注册失败' })
  signup(@Body() auth: {
    email: string;
    image: string;
    username: string;
    password?:string;
    account?: any;
  }) {
    console.log(auth);
    return this.authService.signup(auth)
  }
  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 401, description: '登录失败' })
  signin(@Body() auth: any) {
     console.log("auth",auth.email,auth.code);
    return this.authService.login(auth.email,auth.code);
  }
  @Post('send-verification')
  async sendVerification(@Body() body: { email: string}) {
    return await this.authService.sendVerificationEmail(body.email);
  }
  @Post('verify')
  async verifyEmail(@Query('code') code: string) {
    return this.authService.verifyEmail(code);
  }
  @Post('callback')
  async handleOAuthCallback(@Body() body: {
    provider: string;
    code?: string;
    access_token?: string;
    id_token?: string;
  }) {
    let userInfo: any;



    switch (body.provider) {
      case 'github':
        userInfo = await this.getGitHubUser(body.access_token);
        break;
      case 'google':
        userInfo = await this.getGoogleUser(body.id_token);
        break;
      default:
        throw new BadRequestException('Unsupported provider');
    }

    return this.authService.handleOAuthUser(body.provider, userInfo, body.access_token);
  }
  @Post('refreshtoken')
  @ApiBody({
    type: SigninInput,
    examples: {
      example1: {
        summary: '用户',
        value: {
          refreshtoken: '$2b$10$4.4TPoM4uZQtZE4cXWpub.2Hr3hiSvRL8An7wpFW6UgZiXC2wHqcy'
        }
      }
    }
  })
  async Refreshtoken(@Body() body: {
    refreshtoken: string;
  }) {

    // return body
    // return body.refreshtoken
    return this.authService.refresh(body.refreshtoken);
  }
  @Get('devices')
  @UseGuards(JwtAuthGuard)
  async getUserDevices(@CurrentUser() user) {
    return this.prisma.session.findMany({
      where: { userId: user.userId },
      select: {
        id: true,
        createdAt: true,
        deviceInfo: true,
        ipAddress: true
      }

    });
  }

  @Delete('devices/:id')
  @UseGuards(JwtAuthGuard)
  async revokeDevice(
    @CurrentUser() user,
    @Param('id') deviceId: string
  ) {
    return this.prisma.session.delete({
      where: {
        id: deviceId,
        userId: user.userId
      }
    });
  }
  private async getGitHubUser(accessToken: string) {
    const res = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return res.json();
  }

  private async getGoogleUser(idToken: string) {
    const res = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + idToken);
    return res.json();
  }
}
