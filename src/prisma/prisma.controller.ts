import { Injectable ,Controller} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Controller('prisma')
export class Prismacontroller extends PrismaClient {
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get('DATABASE_URL'),
        },
      },
    });
  }

  cleanDb() {
    return this.$transaction([
      // this.bookmark.deleteMany(),
      this.user.deleteMany(),
    ]);
  }
}
