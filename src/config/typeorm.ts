import { registerAs } from "@nestjs/config";
import { config as dotenvConfig } from 'dotenv';
// import { User } from "src/auth/entities/user.entity";
import { CartItem } from "src/cart/entities/cart.entity";
import { Order } from "src/orders/entities/order.entity";
import { Payment } from "src/payment/entities/payment.entity";
import { Product } from "src/products/entities/product.entity";
import { DataSource, DataSourceOptions } from "typeorm";

dotenvConfig({ path: '.env' });

const config = {
    type: 'mysql',
    host: process.env.DATABASE_HOST || 'localhost', // Default to localhost if undefined
    port: parseInt(process.env.DATABASE_PORT || '3306', 10), // Convert port to number
    username: process.env.DATABASE_USERNAME || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'ecommerce',
    entities: ["dist/entity/*{.ts,.js}"],
    migrations: ["dist/migrations/*{.ts,.js}"],
    autoLoadEntities: true,
    synchronize: false,
};

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);