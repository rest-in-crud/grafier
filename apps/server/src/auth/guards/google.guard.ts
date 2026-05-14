import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleGuard extends AuthGuard('google') {
    getAuthenticateOptions() {
        return {
            prompt: 'select_account',
        };
    }
}
