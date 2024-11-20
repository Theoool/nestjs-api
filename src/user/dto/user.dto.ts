import {
  IsEmail,
  IsOptional,
  isString,
  IsString,
} from 'class-validator';

export class EditUserDto {
  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  id: string;

  @IsString()
  @IsOptional()
  username?: string;


  @IsEmail()
  @IsOptional()
  email?: string;
}
