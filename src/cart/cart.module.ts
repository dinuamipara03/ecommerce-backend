import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartItem } from './entities/cart.entity';
import { ProductModule } from '../products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartItem]),
    ProductModule,  // Import ProductModule to use its exported ProductService
  ],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
