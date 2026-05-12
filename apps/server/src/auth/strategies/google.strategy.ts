import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { UsersService } from '../../users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        private config: ConfigService,
        private usersService: UsersService,
    ) {
        super({
            clientID: config.getOrThrow('GOOGLE_CLIENT_ID'),
            clientSecret: config.getOrThrow('GOOGLE_CLIENT_SECRET'),
            callbackURL: config.getOrThrow('GOOGLE_CALLBACK_URL'),
            scope: ['email', 'profile'],
        });
    }

    async validate(
        _accessToken: string,
        _refreshToken: string,
        profile: Profile,
        done: VerifyCallback,
    ) {
        const email = profile.emails?.[0].value;
        const name = profile.displayName;

        if (!email) return done(new Error('No email from Google'), false);

        let user = await this.usersService.findByProviderId('google', profile.id);

        if (!user) {
            user = await this.usersService.createOAuthUser(email, name, 'google', profile.id);
        }

        done(null, user);
    }
}
