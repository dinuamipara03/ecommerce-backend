import { IsEmail, IsString } from "class-validator";
import { PrimaryGeneratedColumn } from "typeorm";

export class UserDto {
    @PrimaryGeneratedColumn()
    id: number;

    @IsString()
    name: string;

    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    password: string;

    @IsString()
    role: 'ADMIN' | 'SELLER' | 'BUYER';
  }
  