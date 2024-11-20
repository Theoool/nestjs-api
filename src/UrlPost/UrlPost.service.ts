import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
// import * as bcrypt from 'bcrypt';
import parseWebPageForAI from '../unict';
import { UrlPost } from '@prisma/client';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class urlPostService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private httpService: HttpService,
  ) {}
  async createUrlPost(url: string): Promise<any> {
     
        const data = await parseWebPageForAI(url);
        return data;
  }
  async getUrlPosts(id: string) {
    return await this.prisma.urlPost.findMany({
      where: {
        UserFavoriteId: id, 
      },
    });
  }
  async getUrlPost(id: string) {
    return await this.prisma.urlPost.findUnique({
      where: {
        id,
      },
    });
  }
  async updateUrlPost(id: string, data: UrlPost) {
    return await this.prisma.urlPost.update({
      where: { id },
      data,
    });
  }

  async deleteUrlPost(id: string) {
    return await this.prisma.urlPost.delete({
      where: { id },
    });
  }

}
