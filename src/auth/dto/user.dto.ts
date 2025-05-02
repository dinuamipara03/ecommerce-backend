import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from "class-validator";
import { PrimaryGeneratedColumn } from "typeorm";

export class UserDto {
    @IsString()
    @IsNotEmpty({message:'name is required'})
    name: string;

    @IsString()
    @IsEmail({},{message:'invalid email format'})
    @IsNotEmpty({message:'email is required'})
    email: string;

    @IsString()
    @IsNotEmpty({message:'password is required'})
    @IsStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
  },{message:'Please add  uppercase, lowercase, number and symbol and minimum 8 character'})
    password: string;

    @IsString()
    @IsNotEmpty({message:'role is required'})
    role: 'ADMIN' | 'SELLER' | 'BUYER';
  }
  