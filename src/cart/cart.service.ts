import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { ProductService } from '../products/products.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private cartRepository: Repository<CartItem>,
    private productService: ProductService,
  ) {}

  async addToCart(userId: number, addToCartDto: AddToCartDto) {
    const product = await this.productService.findById(addToCartDto.productId);
    
    let cartItem = await this.cartRepository.findOne({
      where: { userId, productId: addToCartDto.productId },
    });

    if (cartItem) {
      cartItem.quantity += addToCartDto.quantity;
    } else {
      cartItem = this.cartRepository.create({
        userId,
        productId: addToCartDto.productId,
        quantity: addToCartDto.quantity,
      });
    }

    return this.cartRepository.save(cartItem);
  }

  async getCart(userId: number) {
    const cartItems = await this.cartRepository.find({
      where: { userId },
      relations: ['product'],
    });

    const total = cartItems.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    return {
      items: cartItems.map(item => ({
        id: item.id,
        productId: item.productId,
        name: item.product.name,
        image: item.product.images[0],
        price: item.product.price,
        quantity: item.quantity,
        subtotal: item.product.price * item.quantity,
      })),
      total,
    };
  }

  async removeFromCart(userId: number, cartItemId: number) {
    const cartItem = await this.cartRepository.findOne({
      where: { id: cartItemId, userId }, // Note: checks both ID AND userId
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartRepository.remove(cartItem);
    return { message: 'Item removed from cart' };
}

  async updateQuantity(userId: number, cartItemId: number, quantity: number) {
    const cartItem = await this.cartRepository.findOne({
      where: { id: cartItemId, userId },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    cartItem.quantity = quantity;
    return this.cartRepository.save(cartItem);
  }
}