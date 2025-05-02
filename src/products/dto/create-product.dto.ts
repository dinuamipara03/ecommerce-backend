import { IsString, IsNumber, IsArray, Min, ValidateIf, IsIn, IsOptional, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  @IsIn([
    'Clothing', 'Electronics', 'Beauty & Personal Care', 'Sports & Outdoors', 'Books', 'Toys & Games'
  ])
  category: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantity: number;

  @IsArray()
  @IsOptional()
  images: string[];
}
