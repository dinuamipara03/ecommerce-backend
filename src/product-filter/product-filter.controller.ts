import { Controller, Get, Query } from '@nestjs/common';
import { ProductFilterService } from './product-filter.service';
import { FilterQueryDto } from './dto/filter-query.dto';

@Controller('product-filters')
export class ProductFilterController {
  constructor(private readonly productFiltersService: ProductFilterService) {}

  @Get()
  async filterProducts(@Query() query: FilterQueryDto) {
    const result = await this.productFiltersService.filterProducts(query);
    return {
      message: 'Products filtered successfully',
      data: result.products,
      // metadata: result.metadata,
    };
  }

  @Get('new-arrivals')
  async getNewArrivals() {
    const products = await this.productFiltersService.getNewArrivals();
    return {
      message: 'New arrivals retrieved successfully',
      data: products,
    };
  }
  

  @Get('price-range')
  async getPriceRange() {
    const range = await this.productFiltersService.getPriceRange();
    return {
      message: 'Price range retrieved successfully',
      data: range,
    };
  }

}