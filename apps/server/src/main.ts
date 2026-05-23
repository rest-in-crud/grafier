import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const config = app.get(ConfigService);
    const port = config.getOrThrow<number>('SERVER_PORT');

    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
    app.use(cookieParser());
    app.use(json({ limit: '10mb' }));
    app.use(urlencoded({ extended: true, limit: '10mb' }));
    app.enableCors({
        origin: config.getOrThrow<string>('URL_FRONTEND'),
        credentials: true,
    });

    await app.listen(port);

    console.log(`Server running on port ${port}`);
}

bootstrap();
