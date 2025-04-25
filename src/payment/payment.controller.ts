import { Controller, Post, Body, UseGuards, Request, Get, Param } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('BUYER', 'Buyer')
  async processPayment(@Request() req, @Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.processPayment(req.user.id, createPaymentDto);
  }

  @Get('summary/:orderId')
  @UseGuards(RolesGuard)
  @Roles('BUYER', 'Buyer')
  async getOrderSummary(@Request() req, @Param('orderId') orderId: string) {
    return this.paymentService.getOrderSummary(+orderId, req.user.id);
  }
}