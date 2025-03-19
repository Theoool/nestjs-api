import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class SignupInput {
  @Field()
  @IsEmail()
  email: string;

  image:string;
  account?:string;
  

  @Field({ nullable: true })
  username: string;

 
}


