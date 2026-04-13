import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const config = app.get(ConfigService);

    const pool = new Pool({
        host: config.getOrThrow('DB_HOST'),
        port: config.getOrThrow<number>('DB_PORT'),
        user: config.getOrThrow('DB_USER'),
        password: config.getOrThrow('DB_PASSWORD'),
        database: config.getOrThrow('DB_NAME'),
    });
    await migrate(drizzle(pool), {
        migrationsFolder: `${process.cwd()}/drizzle`,
    });
    await pool.end();

    const host = config.getOrThrow<string>('URL_BACKEND');
    const port = config.getOrThrow<number>('SERVER_PORT');

    app.use(cookieParser());

    app.enableCors({
        origin: config.getOrThrow<string>('URL_FRONTEND'),
        credentials: true,
    });

    await app.listen(port);

    console.log(`Server running on ${host}`);
}

bootstrap();
