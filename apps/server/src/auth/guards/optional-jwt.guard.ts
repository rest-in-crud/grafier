import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
    async canActivate(context: ExecutionContext) {
        try {
            await super.canActivate(context);
        } catch {
            context.switchToHttp().getRequest().user = null;
        }
        return true;
    }
}
