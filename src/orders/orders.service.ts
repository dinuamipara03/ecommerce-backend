import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { ProductService } from '../products/products.service';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private productService: ProductService,
  ) {}

  async create(userId: number, createOrderDto: CreateOrderDto) {
    const order = this.orderRepository.create({
      buyerId: userId,
      address: createOrderDto.address,
      status: OrderStatus.PENDING,
      productQuantities: {}
    });

    const products: Product[] = [];
    for (const item of createOrderDto.products) {
      const product = await this.productService.findById(item.product_id);
      products.push(product);
      order.productQuantities[item.product_id] = item.quantity;
    }
    
    order.products = products;
    const savedOrder = await this.orderRepository.save(order);

    return {
      message: 'Order placed successfully',
      data: {
        order_id: savedOrder.id,
        status: savedOrder.status
      }
    };
  }

  async findAll(userId: number, userRole: string) {
    let query = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.buyer', 'buyer')
      .leftJoinAndSelect('order.products', 'products')
      .leftJoinAndSelect('products.admin', 'admin');

    if (userRole === 'BUYER') {
      query = query.where('order.buyerId = :userId', { userId });
    } else if (userRole === 'ADMIN') {
      query = query.where('products.adminId = :userId', { userId });
    }

    const orders = await query.getMany();
    return orders.map(order => ({
      order_id: order.id,
      buyer: {
        id: order.buyer.id,
        name: order.buyer.name
      },
      products: order.products.map(product => ({
        product_id: product.id,
        name: product.name,
        quantity: order.productQuantities[product.id]
      })),
      status: order.status
    }));
  }

  async updateStatus(orderId: number, userId: number, userRole: string, status: OrderStatus) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['products']
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (userRole === 'ADMIN') {
      const hasProduct = order.products.some(product => product.adminId === userId);
      if (!hasProduct) {
        throw new ForbiddenException('You can only update orders for your products');
      }
    }

    order.status = status;
    await this.orderRepository.save(order);

    return {
      message: `Order status updated to ${status}`
    };
  }

  async remove(id: number) {
    const result = await this.orderRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Order not found');
    }
    return { message: 'Order deleted successfully' };
  }
  
  async findOne(id: number) {
    return this.orderRepository.findOne({
      where: { id },
      relations: ['products'], // Explicitly load the products relation
    });
  }
}
