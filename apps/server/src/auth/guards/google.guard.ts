import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

@Injectable()
export class GoogleGuard extends AuthGuard('google') {
    getAuthenticateOptions(context: ExecutionContext) {
        const req = context.switchToHttp().getRequest<Request>();
        const state = typeof req.query.state === 'string' ? req.query.state : undefined;
        return {
            prompt: 'select_account',
            ...(state ? { state } : {}),
        };
    }
}
