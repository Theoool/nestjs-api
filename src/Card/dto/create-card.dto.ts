import { IsString, IsNotEmpty, isNotEmpty, IsArray, IsOptional } from 'class-validator';
export class CreateCardDto {
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @IsString()
  @IsNotEmpty()
  readonly content: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsNotEmpty()
  readonly UserFavoriteId: string;
  
  @IsArray()
  tags?: string[]



}
