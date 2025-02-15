import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class SignupInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @Field({ nullable: true })
  username?: string;

 
}

// {
//   "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbTUyZ2RycTgwMDAwc2Q1eng1OTd5NHdsIiwiZW1haWwiOiIxMjM0NTY3OEB0ZXN0LmNvbSIsImlhdCI6MTczNTA0NDAwNiwiZXhwIjoxNzM1MDQ0OTA2fQ.f90p6vUWRmrYIsUvSKJASNbnGWYFtPvBunu8oreql8s",
//   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbTUyZ2RycTgwMDAwc2Q1eng1OTd5NHdsIiwiZW1haWwiOiIxMjM0NTY3OEB0ZXN0LmNvbSIsImlhdCI6MTczNTA0NDAwNiwiZXhwIjoxNzM1NjQ4ODA2fQ.48bftU7X6gptf-Db0jwdYYM437fB2-4TEsjjrhn1vak"
// }
