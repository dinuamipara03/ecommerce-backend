import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { FilterQueryDto } from './dto/filter-query.dto';

@Injectable()
export class ProductFilterService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async filterProducts(queryDto: FilterQueryDto) {
    try {
      const {
        sortBy = 'createdAt',
        order = 'desc',
        minPrice,
        maxPrice,
        search,
        category,
      } = queryDto;

      const queryBuilder = this.productRepo
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.admin', 'admin');

      // Apply price filter
      if (minPrice !== undefined) {
        queryBuilder.andWhere('product.price >= minPrice', { minPrice });
      }
      if (maxPrice !== undefined) {
        queryBuilder.andWhere('product.price <= maxPrice', { maxPrice });
      }

      // Apply search filter
      if (search) {
        queryBuilder.andWhere(
          '(LOWER(product.name) LIKE LOWER(search) OR LOWER(product.description) LIKE LOWER(search))',
          { search: `%${search}%` },
        );
      }

      // Apply category filter
      if (category) {
        queryBuilder.andWhere('product.category = :category', {
          category,
        });
      }
      

      // Apply sorting
      queryBuilder.orderBy(`product.${sortBy}`, order.toUpperCase() as 'ASC' | 'DESC');

      // Apply pagination
      // const skip = (page - 1) * limit;
      // queryBuilder.skip(skip).take(limit);

      // Get results and total count
      const [products, total] = await queryBuilder.getManyAndCount();

      // // Calculate pagination metadata
      // const totalPages = Math.ceil(total / limit);
      // const hasNextPage = page < totalPages;
      // const hasPreviousPage = page > 1;

      return {
        products,
        metadata: {
          total,
          // page,
          // limit,
          // totalPages,
          // hasNextPage,
          // hasPreviousPage,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to filter products');
    }
  }

  async getNewArrivals(limit: number = 10) {
    try {
      return await this.productRepo.find({
        order: { createdAt: 'desc' }, // Ensure the casing matches the expected type
        take: limit,
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch new arrivals');
    }
  }

  async getPriceRange() {
    try {
      const result = await this.productRepo
        .createQueryBuilder('product')
        .select('MIN(product.price)', 'minPrice')
        .addSelect('MAX(product.price)', 'maxPrice')
        .getRawOne();

      return {
        minPrice: parseFloat(result.minPrice) || 0,
        maxPrice: parseFloat(result.maxPrice) || 0,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch price range');
    }
  }
} 
