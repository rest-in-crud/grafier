import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const config = app.get(ConfigService);
    const host = config.getOrThrow<string>('URL_BACKEND');
    const port = config.getOrThrow<number>('SERVER_PORT');

    app.enableCors({
        origin: config.getOrThrow<string>('URL_FRONTEND'),
        credentials: true,
    });

    await app.listen(port);

    console.log(`Server running on ${host}`);
}

bootstrap();
