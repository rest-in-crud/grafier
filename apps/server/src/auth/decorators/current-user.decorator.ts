import { AuthUser, isAuthUser } from '@/types/auth.types';
import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const CurrentUser = createParamDecorator((data: keyof AuthUser, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!isAuthUser(user)) {
        throw new UnauthorizedException('Invalid user payload');
    }

    return data ? user[data] : user;
});
