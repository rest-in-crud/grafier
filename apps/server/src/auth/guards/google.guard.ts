import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleGuard extends AuthGuard('google') {
    getAuthenticateOptions(context: ExecutionContext) {
        return {
            prompt: 'select_account',
        };
    }
}
