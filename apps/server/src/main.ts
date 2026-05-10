import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const config = app.get(ConfigService);
    const port = config.getOrThrow<number>('SERVER_PORT');

    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
    app.use(cookieParser());
    app.enableCors({
        origin: config.getOrThrow<string>('URL_FRONTEND'),
        credentials: true,
    });

    await app.listen(port);

    console.log(`Server running on port ${port}`);
}

bootstrap();
