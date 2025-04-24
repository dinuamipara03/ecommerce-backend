import { Type } from 'class-transformer';
import { IsString, IsNumber, IsArray, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantity: number;

  @IsArray()
  images: string[];
}
