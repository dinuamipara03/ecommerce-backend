import { IsEnum, IsNumber } from 'class-validator';
import { PaymentMethod } from '../entities/payment.entity';

export class CreatePaymentDto {
  @IsNumber()
  orderId: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}