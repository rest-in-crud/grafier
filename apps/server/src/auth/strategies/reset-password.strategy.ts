import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { and, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DRIZZLE } from '../../database/database.module';
import { passwordResetTokens } from '../../database/schema/password-reset-tokens';

@Injectable()
export class ResetPasswordStrategy extends PassportStrategy(Strategy, 'reset-password') {
    constructor(
        config: ConfigService,
        @Inject(DRIZZLE) private db: NodePgDatabase,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.getOrThrow('JWT_RESET_SECRET'),
        });
    }

    async validate(payload: { sub: string; jti: string }) {
        const [token] = await this.db
            .select()
            .from(passwordResetTokens)
            .where(
                and(
                    eq(passwordResetTokens.id, payload.jti),
                    eq(passwordResetTokens.userID, payload.sub),
                ),
            );

        if (!token) {
            throw new UnauthorizedException('Invalid or expired reset token');
        }

        return { id: payload.sub, jti: payload.jti };
    }
}
