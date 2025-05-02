import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { OrdersService } from '../orders/orders.service';
import { OrderStatus } from '../orders/entities/order.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private ordersService: OrdersService
  ) {}

  async processPayment(userId: number, createPaymentDto: CreatePaymentDto) {
    try {
      // Get order details with relations
      const order = await this.ordersService.findOne(createPaymentDto.orderId);
      
      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.buyerId !== userId) {
        throw new NotFoundException('Order not found');
      }
      
      // Check if products exist
      if (!order.products || !order.productQuantities) {
        throw new Error('Invalid order data: missing products or quantities');
      }

      // Calculate total amount from order
      const totalAmount = order.products.reduce((sum, product) => {
        const quantity = order.productQuantities[product.id] || 0;
        return sum + (product.price * quantity);
      }, 0);

      // Create payment record
      const payment = this.paymentRepository.create({
        orderId: createPaymentDto.orderId,
        amount: totalAmount,
        paymentMethod: createPaymentDto.paymentMethod,
        status: PaymentStatus.COMPLETED
      });

      await this.paymentRepository.save(payment);

      // Update order status
      await this.ordersService.updateStatus(
        createPaymentDto.orderId,
        userId,
        'BUYER',
        OrderStatus.PROCESSING
      );

      return {
        message: 'Payment processed successfully',
        data: {
          orderId: order.id,
          amount: totalAmount,
          paymentMethod: payment.paymentMethod,
          status: payment.status
        }
      };
    } catch (error) {
      console.error('Payment processing error:', error);
      throw error;
    }
  }

  async getOrderSummary(orderId: number, userId: number) {
    const order = await this.ordersService.findOne(orderId);
    
    if (!order || order.buyerId !== userId) {
      throw new NotFoundException('Order not found');
    }

    const totalAmount = order.products.reduce((sum, product) => {
      return sum + (product.price * order.productQuantities[product.id]);
    }, 0);

    return {
      orderId: order.id,
      items: order.products.map(product => ({
        name: product.name,
        price: product.price,
        quantity: order.productQuantities[product.id],
        subtotal: product.price * order.productQuantities[product.id]
      })),
      totalAmount,
      address: order.address,
      city:order.city,
      pincode:order.pincode
    };
  }
}
