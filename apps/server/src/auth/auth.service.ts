import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CookieOptions, Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import { sessions } from '../database/schema/sessions';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { AuthUser } from '@/types/auth.types';
import { UserResponseDto } from '@/users/dto/user-response.dto';

const REFRESH_COOKIE = 'refresh_token';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private config: ConfigService,
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

        const accessToken = await this.generateAccessToken(user.id, user.email);
        await this.issueRefreshCookie(user.id, res);

        return { accessToken, user: new UserResponseDto(user) };
    }

    async validateUser(email: string, password: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user?.password) return null;
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
        const accessToken = await this.generateAccessToken(oauthUser.id, oauthUser.email);
        await this.issueRefreshCookie(oauthUser.id, res);

        res.cookie('access_token', accessToken, this.accessTokenCookieOptions());

        const frontendUrl = this.config.getOrThrow('URL_FRONTEND');
        res.redirect(`${frontendUrl}/auth/callback`);
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
            sameSite: 'strict',
            maxAge: ttlMs,
        });
    }

    private accessTokenCookieOptions(): CookieOptions {
        const maxAge = Number(this.config.getOrThrow('JWT_ACCESS_TTL_MS'));
        return {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge,
        };
    }
}
