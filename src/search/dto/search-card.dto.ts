import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchCardDto {
  @ApiProperty({ 
    description: '搜索关键词',
    example: '公众号' 
  })
  @IsString()
  query: string;

  @ApiProperty({ 
    description: '作者ID',
    required: false,
    example: 'cm52gdrq80000sd5zx597y4wl'
  })
  @IsString()
  @IsOptional()
  authorId?: string;

  @ApiProperty({ 
    description: '页码',
    minimum: 1,
    default: 1,
    required: false 
  })
  @Type(() => Number) // 添加类型转换
  @IsInt()           // 改用 IsInt
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiProperty({ 
    description: '每页数量',
    minimum: 1,
    default: 20,
    required: false 
  })
  @Type(() => Number) // 添加类型转换
  @IsInt()           // 改用 IsInt
  @Min(1)
  @IsOptional()
  perPage?: number;
}
