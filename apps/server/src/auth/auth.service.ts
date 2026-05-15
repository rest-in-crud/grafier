import {
    ConflictException,
    Inject,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import { sessions } from '../database/schema/sessions';
import { passwordResetTokens } from '../database/schema/password-reset-tokens';
import { emailVerificationTokens } from '../database/schema/email-verification-tokens';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { AuthUser } from '@/types/auth.types';
import { UserResponseDto } from '@/users/dto/user-response.dto';
import { MailService } from '../mail/mail.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

const REFRESH_COOKIE = 'refresh_token';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private config: ConfigService,
        private mailService: MailService,
        @Inject(DRIZZLE) private db: NodePgDatabase,
    ) {}

    async register(registerDto: RegisterDto, res: Response) {
        const existing = await this.usersService.findByEmail(registerDto.email);
        if (existing) throw new ConflictException('Email already in use');

        const hashed = await bcrypt.hash(registerDto.password, 10);
        const user = await this.usersService.createLocalUser({
            email: registerDto.email,
            name: registerDto.name,
            password: hashed,
        });

        await this.sendVerification({ email: user.email });

        const accessToken = await this.generateAccessToken(user.id, user.email);
        await this.issueRefreshCookie(user.id, res);

        return { accessToken, user: new UserResponseDto(user) };
    }

    async validateUser(email: string, password: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user?.password) return null;

        if (!user.isVerified) {
            throw new UnauthorizedException('Please verify your email address before logging in');
        }

        const match = await bcrypt.compare(password, user.password);
        return match ? user : null;
    }

    async login(user: AuthUser, res: Response) {
        const accessToken = await this.generateAccessToken(user.id, user.email);
        await this.issueRefreshCookie(user.id, res);

        return {
            accessToken,
            user: new UserResponseDto(user),
        };
    }

    async refresh(req: Request, res: Response) {
        const token = req.cookies?.[REFRESH_COOKIE];
        if (!token) throw new UnauthorizedException('No refresh token');

        const payload = await this.jwtService
            .verifyAsync<{ sub: string; jti: string }>(token, {
                secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
            })
            .catch(() => {
                throw new UnauthorizedException('Invalid refresh token');
            });

        const [deleted] = await this.db
            .delete(sessions)
            .where(eq(sessions.id, payload.jti))
            .returning({ userID: sessions.userID });

        if (!deleted) throw new UnauthorizedException('Session not found or already used');

        const user = await this.usersService.findOne(payload.sub);
        if (!user) throw new UnauthorizedException('User not found');

        const accessToken = await this.generateAccessToken(user.id, user.email);
        await this.issueRefreshCookie(user.id, res);

        return { accessToken };
    }

    async me(user: AuthUser) {
        const me = await this.usersService.findOne(user.id);
        if (!me) throw new UnauthorizedException('User not found');

        return {
            user: new UserResponseDto(me),
        };
    }

    async logout(req: Request, res: Response) {
        const token = req.cookies?.[REFRESH_COOKIE];
        if (token) {
            const payload = await this.jwtService
                .verifyAsync<{ jti: string }>(token, {
                    secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
                })
                .catch(() => null);

            if (payload) {
                await this.db.delete(sessions).where(eq(sessions.id, payload.jti));
            }
        }

        res.clearCookie(REFRESH_COOKIE);
        return { message: 'Logged out' };
    }

    async googleCallback(oauthUser: AuthUser, res: Response) {
        await this.issueRefreshCookie(oauthUser.id, res);

        const frontendUrl = this.config.getOrThrow<string>('URL_FRONTEND').replace(/\/$/, '');
        res.redirect(`${frontendUrl}/callback`);
    }

    async forgotPassword(dto: ForgotPasswordDto) {
        const user = await this.usersService.findByEmail(dto.email);
        if (!user || user.provider !== 'local') {
            return { message: 'Mayhaps the password reset link was sent, who knows' };
        }

        await this.db.delete(passwordResetTokens).where(eq(passwordResetTokens.userID, user.id));

        const ttlMs = Number(this.config.getOrThrow('JWT_RESET_TTL_MS'));
        const expiresAt = new Date(Date.now() + ttlMs);

        const [tokenId] = await this.db
            .insert(passwordResetTokens)
            .values({ userID: user.id, expiresAt })
            .returning({ id: passwordResetTokens.id });

        const token = await this.jwtService.signAsync(
            { sub: user.id, jti: tokenId.id },
            {
                secret: this.config.getOrThrow('JWT_RESET_SECRET'),
                expiresIn: this.config.getOrThrow('JWT_RESET_EXPIRES_IN'),
            },
        );

        await this.mailService.sendForgotPasswordEmail(user.email, user.name, token);

        return { message: 'Mayhaps the password reset link was sent, who knows' };
    }

    async resetPassword(userId: string, jti: string, dto: ResetPasswordDto) {
        await this.db.delete(passwordResetTokens).where(eq(passwordResetTokens.id, jti));
        await this.usersService.update(userId, { password: dto.password });

        return { message: 'Password reset successful' };
    }

    async sendVerification(dto: VerifyEmailDto) {
        const user = await this.usersService.findByEmail(dto.email);
        const genericMessage = { message: 'Mayhaps the email verification link was sent, who knows' };

        if (!user || user.provider !== 'local' || user.isVerified) {
            return genericMessage;
        }

        await this.db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.userID, user.id));

        const ttlMs = Number(this.config.getOrThrow('JWT_VERIFICATION_TTL_MS'));
        const expiresAt = new Date(Date.now() + ttlMs);

        const [tokenId] = await this.db
            .insert(emailVerificationTokens)
            .values({ userID: user.id, expiresAt })
            .returning({ id: emailVerificationTokens.id });

        const token = await this.jwtService.signAsync(
            { sub: user.id, jti: tokenId.id },
            {
                secret: this.config.getOrThrow('JWT_VERIFICATION_SECRET'),
                expiresIn: this.config.getOrThrow('JWT_VERIFICATION_EXPIRES_IN'),
            },
        );

        await this.mailService.sendVerificationEmail(user.email, user.name, token);

        return genericMessage;
    }

    async confirmEmail(userId: string, jti: string) {
        await this.db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.id, jti));
        await this.usersService.update(userId, { isVerified: true });

        return { message: 'Email verified successfully' };
    }

    private generateAccessToken(userId: string, email: string) {
        return this.jwtService.signAsync(
            { sub: userId, email },
            {
                secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
                expiresIn: this.config.getOrThrow('JWT_ACCESS_EXPIRES_IN'),
            },
        );
    }

    private async issueRefreshCookie(userId: string, res: Response) {
        const ttlMs = Number(this.config.getOrThrow('JWT_REFRESH_TTL_MS'));
        const expiresAt = new Date(Date.now() + ttlMs);

        const [session] = await this.db
            .insert(sessions)
            .values({ userID: userId, expiresAt })
            .returning({ id: sessions.id });

        const jwt = await this.jwtService.signAsync(
            { sub: userId, jti: session.id },
            {
                secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
                expiresIn: this.config.getOrThrow('JWT_REFRESH_EXPIRES_IN'),
            },
        );

        res.cookie(REFRESH_COOKIE, jwt, {
            httpOnly: true,
            secure: this.config.get('NODE_ENV') === 'production',
            sameSite: 'lax',
            maxAge: ttlMs,
        });
    }
}
