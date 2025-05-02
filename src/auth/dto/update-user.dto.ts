import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { UserDto } from "./user.dto";
import { PartialType } from "@nestjs/mapped-types";

export class UpdateUserDto extends PartialType(UserDto) {
    @IsString()
    name?: string;

    @IsString()
    @IsEmail()
    email?: string;

    @IsString()
    password?: string;

    @IsString()
    role?: 'ADMIN' | 'SELLER' | 'BUYER';
  }
  