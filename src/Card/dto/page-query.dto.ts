import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PageQueryDto {
  @ApiProperty({ description: '页码', default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ description: '每页数量', default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  pageSize?: number = 10;

  @ApiProperty({ description: '排序字段', required: false })
  @IsString()
  @IsOptional()
  orderBy?: string = 'createdAt';

  @ApiProperty({ description: '排序方向', enum: ['asc', 'desc'], default: 'desc', required: false })
  @IsString()
  @IsOptional()
  order?: 'asc' | 'desc' = 'desc';
}
