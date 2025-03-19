import { Controller, Get } from '@nestjs/common';
import { OssService } from './Oss.service';

@Controller()
export class AppController {
  constructor(private readonly OssService: OssService) {}

  @Get()
 async  getHello():Promise<any> {
    return await  this.OssService.generateUploadSignature('hello');
  }
  
  
}
