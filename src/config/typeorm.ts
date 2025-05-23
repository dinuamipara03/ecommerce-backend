import { registerAs } from "@nestjs/config";
import { config as dotenvConfig } from 'dotenv';
import { url } from "inspector";
import { DataSource, DataSourceOptions } from "typeorm";

dotenvConfig({ path: '.env' });

const config = {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: ["dist/entity/*{.ts,.js}"],
    migrations: ["dist/migrations/*{.ts,.js}"],
    autoLoadEntities: true,
    synchronize: false,
};

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
