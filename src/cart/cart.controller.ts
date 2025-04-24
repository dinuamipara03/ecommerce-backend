import { Controller, Get, Post, Body, Delete, Param, Put, UseGuards, Request } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard) 
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @UseGuards( RolesGuard)
   @Roles('BUYER','Buyer')
  async addToCart(@Request() req, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addToCart(req.user.id, addToCartDto);
  }

  @Get()
  async getCart(@Request() req) {
    return this.cartService.getCart(req.user.id);
  }

  @Delete(':id')
  async removeFromCart(@Request() req, @Param('id') id: string) {
    return this.cartService.removeFromCart(req.user.id, parseInt(id));
  }

  @Put(':id')
  async updateQuantity(
    @Request() req,
    @Param('id') id: string,
    @Body('quantity') quantity: number,
  ) {
    return this.cartService.updateQuantity(req.user.id, parseInt(id), quantity);
  }
}