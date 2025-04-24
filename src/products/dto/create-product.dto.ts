import { IsString, IsNumber, IsArray, Min, ValidateIf, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  @IsIn([
    'Clothing', 'Electronics', 'Beauty & Personal Care', 'Sports & Outdoors', 'Books', 'Toys & Games'
  ])
  category: string;

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
