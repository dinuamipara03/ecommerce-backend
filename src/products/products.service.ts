import { Injectable, InternalServerErrorException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto & { adminId: number }) {
    try {
      // Create the product instance with all fields
      const product = this.productRepo.create({
        name: createProductDto.name,
        description: createProductDto.description,
        category: createProductDto.category,
        price: createProductDto.price,
        quantity: createProductDto.quantity,
        images: createProductDto.images || [],
        adminId: createProductDto.adminId
      });

      console.log('Attempting to save product:', product); // Debug log
      
      // Save the product
      const savedProduct = await this.productRepo.save(product);
      console.log('Product saved successfully:', savedProduct); // Debug log
      
      return savedProduct;
    } catch (error) {
      console.error('Error creating product:', error); // Debug log
      
      throw new InternalServerErrorException(`Failed to create product: ${error.message}`);
    }
  }

  async findAll() {
    try {
      return await this.productRepo.find({
        relations: ['admin'] //entity or model has a relationship with another entity called "Admin"
      });
    } catch (error) {
      // console.error('Error fetching products:', error);
      throw new InternalServerErrorException('Failed to fetch products');
    }
  }

  async findById(id: number) {
    try {
      const product = await this.productRepo.findOne({
        where: { id },
        relations: ['admin']
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      return product;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      // console.error('Error fetching product:', error);
      throw new InternalServerErrorException('Failed to fetch product');
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    try {
      // First check if product exists
      const product = await this.findById(id);
      
      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      // Merge the existing product with the update data
      const updatedProduct = {
        ...product,
        ...updateProductDto
      };

      // Save the updated product
      const result = await this.productRepo.save(updatedProduct);
      
      return result;
    } catch (error) {
      console.error('Error updating product:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update product');
    }
  }

  async remove(id: number) {
    try {
      const result = await this.productRepo.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      // console.error('Error deleting product:', error);
      throw new InternalServerErrorException('Failed to delete product');
    }
  }
}
