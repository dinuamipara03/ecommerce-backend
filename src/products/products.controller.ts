import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
  UnauthorizedException,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ProductService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { TransformImageInterceptor } from './transform-image.interceptor';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
 @Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'ADMIN')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  )
  async create(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() createProductDto: CreateProductDto,
    @Request() req,
  ) {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Invalid user credentials');
      }

      const imageUrls = files
        ? files.map(file => `http://localhost:8000/uploads/${file.filename}`)
        : [];

      const productData = {
        ...createProductDto,
        images: imageUrls,
        adminId: req.user.id,
      };

      const createdProduct = await this.productService.create(productData);
 
      return {
        message: 'Product created successfully',
        data: createdProduct,
      };
    } catch (error) {
      throw error;
    }
  }

  @Get()  
  @UseInterceptors(TransformImageInterceptor)
  async findAll() {
    const products = await this.productService.findAll();
    return {
      message: 'Products retrieved successfully',
      data: products,
    };
  }

  @Get(':id')
  @UseInterceptors(TransformImageInterceptor)
  async findOne(@Param('id') id: string) {
    const product = await this.productService.findById(parseInt(id));
    return {
      message: 'Product retrieved successfully',
      data: product,
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin','ADMIN')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    try {
      const product = await this.productService.findById(parseInt(id));

      if (req.user.role !== 'Admin' && product.adminId !== req.user.id) {
        throw new ForbiddenException('You can only update your own products');
      }

      let updateData = { ...updateProductDto };

      // Handle new image uploads if any
      if (files && files.length > 0) {
        const newImageUrls = files.map(file => 
          `http://localhost:8000/uploads/${file.filename}`
        );
        
        // If you want to replace existing images
        updateData.images = newImageUrls;
      }

      const data = await this.productService.update(parseInt(id), updateData);
      return {
        message: 'Product updated successfully',
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin','ADMIN')
  async remove(@Param('id') id: string, @Request() req) {
    await this.productService.remove(parseInt(id));
    return { message: 'Product deleted successfully' };
  }
}
