import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService,
    @InjectRedis() private readonly redis: Redis,
    private jwtService: JwtService) {}

  async sendVerificationEmail(email: string) {
    const text = this.generateRandomString(10)
    const redisKey = `email:code:${email}`; // 为每个邮箱创建唯一的Redis键
    await this.redis.set(redisKey, text, 'EX', 60 * 60); // 设置过期时间为1小时
    const redisData = await this.redis.get(redisKey);
    console.log(`验证码 for ${email}:`, redisData);
    // return redisData
    await this.mailerService.sendMail({
      to: email,
      subject: 'Login for webshare',
      template: 'verification',
      context: {
        email:email,
        url:text
      },
    });
  }

  generateRandomString(length: number = 10): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    
    return result;
  }
  generateVerificationToken({email,userame,password,image}): string {
    const token = this.jwtService.sign(
      {email,userame,password,image},
      {
        expiresIn: '24h',  // 24小时有效期
        secret: process.env.JWT_SECRET_KEY,  // 建议放在环境变量中
      }
    );
    const verificationUrl = `${process.env.NEXT_URL}/login/?token=${token}`;
    return verificationUrl;
  }
  
  async verifyToken(code: string, email?: string) {
    try {
      // 如果提供了email，使用特定的键获取验证码，否则尝试使用通用键
      const redisKey = email ? `email:code:${email}` : 'code';
      // 从Redis中获取存储的验证码
      const storedCode = await this.redis.get(redisKey);
      console.log(`验证码 for ${redisKey}:`, storedCode);

      // 验证码不存在或已过期
      if (!storedCode) {
        return {
          success: false,
          message: '验证码不存在或已过期'
        };
      }
      
      // 比对验证码
      if (storedCode === code) {
        // 验证成功后删除验证码，防止重复使用
        await this.redis.del(redisKey);
        return {
          success: true,
          message: '验证码验证成功'
        };
      } else {
        return {
          success: false,
          message: '验证码不正确'
        };
      }
    } catch (error) {
      console.error('验证码验证失败:', error);
      return {
        success: false,
        message: '验证码验证过程中发生错误'
      };
    }
  }
}
