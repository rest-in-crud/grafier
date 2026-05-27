import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';

@Catch()
export class GoogleCallbackFilter implements ExceptionFilter {
    constructor(private readonly config: ConfigService) {}

    catch(exception: unknown, host: ArgumentsHost) {
        const res = host.switchToHttp().getResponse<Response>();
        const frontendUrl = this.config.getOrThrow<string>('URL_FRONTEND').replace(/\/$/, '');
        const message = exception instanceof Error ? exception.message : 'Authentication failed';
        res.redirect(`${frontendUrl}/signin?error=${encodeURIComponent(message)}`);
    }
}
