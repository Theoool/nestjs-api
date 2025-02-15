import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Prismacontroller } from './prisma.controller';

import { SearchModule } from 'src/search/search.module';
@Global()
@Module({
  imports:[SearchModule],
  controllers: [Prismacontroller],
    providers: [PrismaService,],
  exports: [PrismaService],
})
export class PrismaModule {}

