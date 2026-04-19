import { AuthUser } from '@/types/auth.types';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): AuthUser => {
        return ctx.switchToHttp().getRequest().user;
    },
);
