import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { User } from '@prisma/client'; 
import { MailService } from 'src/email/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async signup(payload: {
    email: string;
    image: string;
    username?: string;
    password?: string; // 本地注册需要密码
    account?: any;     // 第三方登录账号信息
  }) {
    // 检查用户是否存在
    const existingUser = await this.prisma.user.findUnique({ 
      where: { email: payload.email },
      include: { account: true }
    });

    if (existingUser) {
      if (existingUser.account && payload.account) {
        throw new ConflictException('第三方账号已存在');
      }
      return this.signin(payload.email);
    }


    // 处理密码哈希（仅限本地注册）
    let hashedPassword = '';
    if (payload.password && !payload.account) {
      hashedPassword = await bcrypt.hash(payload.password, 10);
    }

    const user = await this.prisma.user.create({
      data: {
        email: payload.email,
        image: payload.image,
        password: hashedPassword,
        username: payload.username || `user_${Math.random().toString(36).slice(2, 8)}`,
        account: payload.account ? {
          create: {
            provider: payload.account.provider,
            type: payload.account.type,
            providerAccountId: payload.account.providerAccountId,
            access_token: payload.account.access_token,
            token_type: payload.account.token_type,
            scope: payload.account.scope
          }
        } : undefined
      },
      include: { account: true }
    });
    // 创建默认收藏夹
    if (user.id) {
      await this.prisma.userFavorite.create({
        data: {
          secondaryUserId: user.id,
          primaryUserId: user.id,
          title: "我的合集",
          isPublic: false
        }
    });
    }

    return this.generateTokens(user);
  }

  private async signin(email: string, password?: string) {
    const user = await this.prisma.user.findUnique({ 
      where: { email },
      include: { account: true }
    });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    // 检查账户状态
    if (user.accountStatus !== 'ACTIVE') {
      throw new UnauthorizedException(`账户状态异常：${user.accountStatus}`);
    }
    return this.generateTokens(user);
  }

  async login(email: string, code: string) {
    // 验证验证码
    console.log(email, code);
    
    const verificationResult = await this.mailService.verifyToken(code, email);
    if (verificationResult.success) {
      const user = await this.prisma.user.findUnique({ 
        where: { email },
        // include: { account: true }
      });
      console.log(user);
      
      if (!user) {
        console.log("用户不存在");
        
        throw new UnauthorizedException('用户不存在');
      }
      // 检查账户状态
      if (user.accountStatus !== 'ACTIVE') {
        throw new UnauthorizedException(`账户状态异常：${user.accountStatus}`);
      }

  
      return this.generateTokens(user);
    }else{
      console.log(verificationResult);
      
      return verificationResult
    }
   
  }
 
  async refresh(refreshToken: string) {
    try {
      // 验证刷新令牌
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE
      });
      
      // 查找用户和会话
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { sessions: true }
      });

      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }

      // 查找对应的会话
      const session = user.sessions.find(session => 
        session.sessionToken === refreshToken && 
        session.expires > new Date()
      );

      if (!session) {
        throw new UnauthorizedException('会话已过期或无效');
      }

      // 验证存储的刷新令牌哈希
      if (user.refreshToken) {
        const isValidToken = await bcrypt.compare(refreshToken, user.refreshToken);
        if (!isValidToken) {
          throw new UnauthorizedException('刷新令牌无效');
        }
      }

      // 生成新的令牌
      const tokens = await this.generateTokens(user);
      
      // 更新会话过期时间
      await this.prisma.session.update({
        where: { id: session.id },
        data: { 
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 延长会话有效期
        }
      });

      return tokens;
    } catch (error) {
      console.error('刷新令牌失败:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('刷新令牌失败');
    }
  }
  async logout(userId: string, sessionToken?: string) {
    // 清除特定会话或全部会话
    if (sessionToken) {
      await this.prisma.session.deleteMany({
        where: { 
          userId,
          sessionToken 
        }
      });
    } else {
      await this.prisma.session.deleteMany({
        where: { userId }
      });
    }

    // 清除刷新令牌
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }
  async handleOAuthUser(provider: string, profile: any, accessToken: string) {
    const email = profile.email || `${profile.id}@${provider}.com`;
    const user = await this.prisma.user.upsert({
      where: { email },
      create: {
        email,
        username: profile.name || profile.login || profile.given_name,
        image: profile.avatar_url || profile.picture || profile.avatar,
        account: {
          create: {
            provider,
            type: 'oauth',
            providerAccountId: profile.id?.toString() || profile.sub,
            access_token: accessToken,
          }
        }
      },
      update: {
        image: profile.avatar_url || profile.picture,
        account: {
          update: {
            access_token: profile.access_token,
          }
        }
      },
      include: { account: true }
    });
    return this.generateTokens(user);
  }

  private async generateTokens(user: User, req?: any) {
    const accessPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      iss: process.env.JWT_ISSUER,        // 签发者
      aud: process.env.JWT_AUDIENCE       // 受众
    };

    const refreshPayload = {
      sub: user.id,
      iss: process.env.JWT_ISSUER,
      aud: process.env.JWT_AUDIENCE
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '24h'
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d'  // 7天有效期，与next-auth默认保持一致
      })  
    ]);

    // 获取设备信息和IP地址
    const deviceInfo = req?.headers?.['user-agent'] || 'unknown';
    const ipAddress = req?.ip || req?.connection?.remoteAddress || 'unknown';
    
    // 计算会话过期时间 - 7天后过期，与next-auth默认保持一致
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // 创建新的会话记录 - 兼容next-auth会话格式
    await this.prisma.session.create({
      data: {
        sessionToken: refreshToken,
        userId: user.id,
        deviceInfo,
        ipAddress,
        expires: expiresAt
      }
    });

    // 更新用户最后登录时间
    await this.prisma.user.update({
      where: { id: user.id },
      data: { 
        lastLogin: new Date(),
        refreshToken: await bcrypt.hash(refreshToken, 10)
      }
    });

    return {
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        image: user.image
      }
    };
  }
  async sendVerificationEmail(email) {
    // 生成验证链接
    // const verificationUrl = this.mailService.generateVerificationToken({email,userame,password,image});
    // 发送验证邮件
  //  console.log(verificationUrl);
   
    await this.mailService.sendVerificationEmail(email);
  }

async verifyEmail(code: string) {
  console.log("验证码", code);
  try {
    // 使用mailService验证验证码
    const verificationResult = await this.mailService.verifyToken(code);
    
    if (!verificationResult.success) {
      return { 
        success: false, 
        message: verificationResult.message || '验证失败',
        error: null
      };
    }
    
    // 验证成功后，可以从Redis中获取相关用户信息并完成注册
    // 注意：这里需要根据实际情况修改，可能需要前端传递额外的用户信息
    // 或者在发送验证码时将用户信息存储在Redis中
    
    // 示例：假设用户信息已经在前端提供
    // const data = await this.signup(userInfo);
    
    return { 
      success: true, 
      message: '验证成功', 
      // data: data // 如果需要返回用户数据
    };
  } catch (error) {
    console.error('验证码验证过程中发生错误:', error);
    
    return { 
      success: false, 
      message: '验证过程中发生错误', 
      error: error.message 
    };
  }
}
}
