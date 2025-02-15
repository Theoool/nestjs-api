import { IsString, IsNotEmpty, IsUUID, IsOptional, IsBoolean } from 'class-validator';

export class UserFavoriteDto {
  @IsString()
  @IsOptional()
  readonly keyword?: string;
  
  @IsString()

  readonly title: string;



  @IsBoolean()
  @IsOptional()
  readonly isPublic?: boolean = true;
}

// {
//   "title":"第一个合集",
//   "content":"第一个合集",
//   "isPublic":true
//   }
