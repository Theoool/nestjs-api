import { IsEmail, IsNotEmpty, MinLength,IsBoolean, } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class SigninInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  @MinLength(8)
  password?: string;

  @Field()
  @IsBoolean()
  rememberMe?:boolean;
  

 
}
