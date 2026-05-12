import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { isAuthUser } from '../../types/auth.types';

@Injectable()
export class IsAccountOwnerGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();
        const user = request.user;
        const paramId = request.params.id;

        if (!isAuthUser(user)) {
            throw new ForbiddenException('Authentication required');
        }

        if (user.id !== paramId) {
            throw new ForbiddenException('You can only modify your own account');
        }

        return true;
    }
}
