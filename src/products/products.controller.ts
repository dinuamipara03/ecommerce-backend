import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  UploadedFiles,
  UseInterceptors,
  Request,
  ForbiddenException,
  UnauthorizedException,
  UploadedFile,
} from '@nestjs/common';
import { ProductService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { put } from '@vercel/blob';
import { FileInterceptor } from '@nestjs/platform-express';
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}
  
    @Post()
    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles('Admin',"ADMIN")
    @UseInterceptors(FileInterceptor('images')) // match your frontend file input name
    async create(
      @Body() createProductDto: CreateProductDto,
      @UploadedFile() file: Express.Multer.File,
      @Request() req
    ) {
      if (!file) {
        throw new Error('File is required');
      }
  
      // Ensure filename is unique
      const uniqueFilename = `${Date.now()}-${file.originalname}`;
  
      const blob = await put(uniqueFilename, file.buffer, {
        access: 'public',
        addRandomSuffix: true, // Just in case — adds random suffix
      });
  
      // Save blob URL in the product DTO
      createProductDto.images = [blob.url];
  
      // Add adminId to the DTO
      const adminId = req.user.id; // Replace with logic to get the adminId from the request or context
      return this.productService.create({ ...createProductDto, adminId });
    }
  

  @Get()
  async findAll() {
    const products = await this.productService.findAll();
    return {
      message: 'Products retrieved successfully',
      data: products,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const product = await this.productService.findById(+id);
    return {
      message: 'Product retrieved successfully',
      data: product,
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'ADMIN')
  @UseInterceptors(FilesInterceptor('images', 10))
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const product = await this.productService.findById(+id);
    if (req.user.role !== 'Admin' && product.adminId !== req.user.id) {
      throw new ForbiddenException('You can only update your own products');
    }

    const imageUrls: string[] = [];

    if (files && files.length) {
      for (const file of files) {
        const blob = await put(file.originalname, file.buffer, {
          access: 'public',
          addRandomSuffix: true,
        });
        imageUrls.push(blob.url);
      }
    }

    const updateData = {
      ...updateProductDto,
      images: imageUrls.length ? imageUrls : product.images,
    };

    const updated = await this.productService.update(+id, updateData);

    return {
      message: 'Product updated successfully',
      data: updated,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'ADMIN')
  async remove(@Param('id') id: string) {
    await this.productService.remove(+id);
    return {
      message: 'Product deleted successfully',
    };
  }
}
