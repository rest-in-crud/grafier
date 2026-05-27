import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const config = app.get(ConfigService);
    const port = config.getOrThrow<number>('SERVER_PORT');

    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
    app.use(cookieParser());
    app.use(json({ limit: '10mb' }));
    app.use(urlencoded({ extended: true, limit: '10mb' }));
    app.enableCors({
        origin: config.getOrThrow<string>('URL_FRONTEND'),
        credentials: true,
    });

    const swaggerConfig = new DocumentBuilder()
        .setTitle('Grafier API')
        .setDescription(
            'Server-side API for the Grafier design app: authentication, user accounts, designs, projects, templates, checkpoints, and public sharing.',
        )
        .setVersion('0.1.0')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Short-lived access JWT issued by /auth/login or /auth/refresh.',
            },
            'access-token',
        )
        .addCookieAuth(
            'refresh_token',
            {
                type: 'apiKey',
                in: 'cookie',
                description: 'httpOnly refresh cookie set by /auth/login.',
            },
            'refresh-cookie',
        )
        .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document, {
        swaggerOptions: { persistAuthorization: true },
    });

    await app.listen(port);

    console.log(`Server running on port ${port}`);
    console.log(`Swagger docs at http://localhost:${port}/docs`);
}

bootstrap();
