// src/url-check/url-check.dto.ts
import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckUrlsDto {
  @ApiProperty({ example: ['https://example.com'] })
  @IsArray()
  @IsString({ each: true })
  urls: string[];
}

export class UrlCheckResultDto {
  @ApiProperty()
  originalUrl: string;

  @ApiProperty()
  finalUrl: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  latency: number | null;

  @ApiProperty()
  success: boolean;

  @ApiProperty({ nullable: true })
  error: string | null;
}
