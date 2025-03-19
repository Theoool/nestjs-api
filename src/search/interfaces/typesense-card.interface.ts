// src/search/interfaces/typesense-card.interface.ts

export interface SearchCollection {
  id: string;             // 与Prisma Card.id对应
  title: string;          // 卡片标题
  content: string;        // 卡片内容
  url:string;
  image:string;
  tags:string[],
  authorId: string;      // 关联作者ID（用于过滤）
  createdAt: Date|number;     // 创建时间戳（秒级）
 
 
}
