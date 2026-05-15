import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { and, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DRIZZLE } from '../../database/database.module';
import { emailVerificationTokens } from '../../database/schema/email-verification-tokens';

@Injectable()
export class EmailVerificationStrategy extends PassportStrategy(Strategy, 'email-verification') {
    constructor(
        config: ConfigService,
        @Inject(DRIZZLE) private db: NodePgDatabase,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.getOrThrow('JWT_VERIFICATION_SECRET'),
        });
    }

    async validate(payload: { sub: string; jti: string }) {
        const [token] = await this.db
            .select()
            .from(emailVerificationTokens)
            .where(
                and(
                    eq(emailVerificationTokens.id, payload.jti),
                    eq(emailVerificationTokens.userID, payload.sub),
                ),
            );

        if (!token) {
            throw new UnauthorizedException('Invalid or expired verification token');
        }

        return { id: payload.sub, jti: payload.jti };
    }
}
