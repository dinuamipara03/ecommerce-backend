import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductFilterService } from './product-filter.service';
import { ProductFilterController } from './product-filter.controller';
import { Product } from '../products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductFilterController],
  providers: [ProductFilterService],
})
export class ProductFilterModule {}