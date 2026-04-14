import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private config: ConfigService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const token = this.extractToken(request);

        if (!token) throw new UnauthorizedException('No access token');

        request.user = await this.jwtService
            .verifyAsync<{ sub: string; email: string }>(token, {
                secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
            })
            .catch(() => {
                throw new UnauthorizedException('Invalid access token');
            });
        return true;
    }

    private extractToken(request: Request): string | null {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : null;
    }
}
