import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';

@Catch()
export class GoogleCallbackFilter implements ExceptionFilter {
    constructor(private readonly config: ConfigService) {}

    catch(_exception: unknown, host: ArgumentsHost) {
        const res = host.switchToHttp().getResponse<Response>();
        const frontendUrl = this.config.getOrThrow<string>('URL_FRONTEND').replace(/\/$/, '');
        res.redirect(`${frontendUrl}/signin?error=oauth`);
    }
}
