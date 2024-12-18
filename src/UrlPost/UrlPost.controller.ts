import { Body, Controller, Post,Get, Param } from '@nestjs/common';
import { urlPostService } from './UrlPost.service';
import { UrlPost } from '@prisma/client';
import { query } from 'express';
import { data } from 'cheerio/dist/commonjs/api/attributes';
// import fetchWebpage from '../unict';

@Controller('PostApi')
export class UrlPostController {
  constructor(private  urlPostService: urlPostService) {}
  @Get('signup')
  signup() {
    return 'I am signing up isp';
  }  
  
  @Post('createUrlPost')
   createUrlPost(@Body() data:{url:string}) {
  // return data.url;
    // if (!url || !/^https?:\/\/[\w\.-]+\.\w{2,}/.test(url)) {
    //   throw new Error('URL is required');
    // }
  // const data =  fetchWebpage(url);
    return this.urlPostService.createUrlPost(data.url);
  }
  

}

