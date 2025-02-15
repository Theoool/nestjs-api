// sync.task.ts
import { Injectable } from '@nestjs/common';
import { SearchService } from './search.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
@Injectable()
export class SyncTask {
  constructor(
    private readonly searchService: SearchService,
    private readonly prisma: PrismaService,
  ) {}

  @Cron('0 3 * * *')
  async fullSync() {
    const batchSize = 100;
    let cursor = '';
    let bookmarks=[];
    do {
      let  bookmark = await this.prisma.card.findMany({
        take: batchSize,
        skip: 0, // Prisma分页机制
        cursor: { id: cursor },
        orderBy: { id: 'asc' },
      });
      bookmarks.push(bookmark)

      if (bookmarks.length === 0) break;
      await this.searchService.bulkUpsertCards(bookmarks);
      cursor = bookmarks[bookmarks.length - 1].id;
    } while (bookmarks.length === batchSize);
  }
}
