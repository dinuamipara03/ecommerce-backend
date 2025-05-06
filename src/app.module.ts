import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { AdminModule } from './admin/admin.module';
import { ProductFilterModule } from './product-filter/product-filter.module';
import { PaymentModule } from './payment/payment.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import typeorm from './config/typeorm';
import * as crypto from 'crypto';
(global as any).crypto = crypto;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm]
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const options = configService.get<TypeOrmModuleOptions>('typeorm');
        if (!options) {
          throw new Error('TypeORM configuration is missing');
        }
        return options;
      }
    }),
    AuthModule,
    ProductModule,
    CartModule,
    OrdersModule,
    AdminModule,
    ProductFilterModule,
    PaymentModule,
  
  ],
})
export class AppModule {}
