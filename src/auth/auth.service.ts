import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(email: string, password: string, username: string) {
    // 检查邮箱是否已存在
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) {
      throw new ConflictException('邮箱已存在');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
      },
    });

    return this.generateTokens(user);
  }
  async getUser() {
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    try {
      return await this.prisma.user.create({
        data: {
          email: 'test@test.com',
          password: hashedPassword,
          username: 'test',
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async signin(email: string, password: string, rememberMe: boolean) {
    // 查找用户
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('密码错误');
    }

    return this.generateTokens(user, rememberMe);
  }

  async refresh(refreshToken: string) {
    try {
      // 验证 refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      // 查找用户
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.hashRt) {
        throw new UnauthorizedException();
      }

      // 验证存储的 refresh token hash
      const rtMatches = await bcrypt.compare(refreshToken, user.hashRt);
      if (!rtMatches) {
        throw new UnauthorizedException();
      }

      return this.generateTokens(user, true);
    } catch {
      throw new UnauthorizedException();
    }
  }

  async logout(userId: string) {
    // 清除 refresh token
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashRt: null },
    });
  }

  private async generateTokens(user: any, rememberMe = false) {
    const payload = { sub: user.id, email: user.email };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    });

    if (rememberMe) {
      const refreshToken = await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      });

      // 存储 refresh token 的哈希值
      const hashRt = await bcrypt.hash(refreshToken, 10);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { hashRt },
      });

      return { accessToken, refreshToken };
    }

    return { accessToken };
  }
}
