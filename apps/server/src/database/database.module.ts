import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export const DRIZZLE = Symbol('DRIZZLE');

@Global()
@Module({
    providers: [
        {
            provide: DRIZZLE,
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                const pool = new Pool({
                    host: config.getOrThrow('DB_HOST'),
                    port: config.getOrThrow<number>('DB_PORT'),
                    user: config.getOrThrow('DB_USER'),
                    password: config.getOrThrow('DB_PASSWORD'),
                    database: config.getOrThrow('DB_NAME'),
                });
                return drizzle(pool, { schema });
            },
        },
    ],
    exports: [DRIZZLE],
})
export class DatabaseModule {}
