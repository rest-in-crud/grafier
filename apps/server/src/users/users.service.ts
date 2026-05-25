import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Inject,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { and, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import { users } from '../database/schema/users';
import { sessions } from '../database/schema/sessions';
import { emailVerificationTokens } from '../database/schema/email-verification-tokens';
import { MailService } from '../mail/mail.service';
import { CreateLocalUserDto } from './dto/create-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { InitiateEmailChangeDto } from './dto/initiate-email-change.dto';
import { UserResponseDto } from './dto/user-response.dto';

const REFRESH_COOKIE = 'refresh_token';

@Injectable()
export class UsersService {
    constructor(
        @Inject(DRIZZLE) private db: NodePgDatabase,
        private jwtService: JwtService,
        private config: ConfigService,
        private mailService: MailService,
    ) {}

    async createLocalUser(dto: CreateLocalUserDto) {
        const [user] = await this.db
            .insert(users)
            .values({
                email: dto.email,
                name: dto.name,
                password: dto.password,
                provider: 'local',
            })
            .returning();
        return user;
    }

    async createOAuthUser(email: string, name: string, provider: string, providerId: string) {
        const [user] = await this.db
            .insert(users)
            .values({ email, name, provider, providerId, isVerified: true })
            .returning();
        return user;
    }

    async findOne(id: string) {
        const [user] = await this.db.select().from(users).where(eq(users.id, id));
        return user ?? null;
    }

    async findByEmail(email: string) {
        const [user] = await this.db.select().from(users).where(eq(users.email, email));
        return user ?? null;
    }

    async update(id: string, data: Partial<typeof users.$inferInsert> & { isVerified?: boolean }) {
        const [updatedUser] = await this.db
            .update(users)
            .set(data)
            .where(eq(users.id, id))
            .returning();

        return updatedUser;
    }

    async findByProviderId(provider: string, providerId: string) {
        const [user] = await this.db
            .select()
            .from(users)
            .where(and(eq(users.provider, provider), eq(users.providerId, providerId)));
        return user ?? null;
    }

    async remove(id: string) {
        await this.db.delete(users).where(eq(users.id, id));
    }

    async updateName(id: string, name: string) {
        const [updatedUser] = await this.db
            .update(users)
            .set({ name })
            .where(eq(users.id, id))
            .returning();
        return new UserResponseDto(updatedUser);
    }

    async changePassword(id: string, dto: ChangePasswordDto, res: Response) {
        const user = await this.findOne(id);
        if (user?.provider !== 'local') {
            throw new ForbiddenException('This action is only available for local accounts');
        }
        if (!user.password) {
            throw new ForbiddenException('No password set on this account');
        }

        const match = await bcrypt.compare(dto.oldPassword, user.password);
        if (!match) {
            throw new UnauthorizedException('Incorrect current password');
        }

        if (dto.oldPassword === dto.newPassword) {
            throw new BadRequestException('New password must differ from current password');
        }

        const hashed = await bcrypt.hash(dto.newPassword, 10);
        await this.db.update(users).set({ password: hashed }).where(eq(users.id, id));

        await this.db.delete(sessions).where(eq(sessions.userID, id));
        res.clearCookie(REFRESH_COOKIE);

        return { message: 'Password changed. Please log in again.' };
    }

    async initiateEmailChange(userId: string, dto: InitiateEmailChangeDto) {
        const user = await this.findOne(userId);
        if (user?.provider !== 'local') {
            throw new ForbiddenException('This action is only available for local accounts');
        }

        if (dto.email === user.email) {
            throw new BadRequestException('New email must differ from your current email');
        }

        const existing = await this.findByEmail(dto.email);
        if (existing) {
            throw new ConflictException('Email already in use');
        }

        await this.db.update(users).set({ pendingEmail: dto.email }).where(eq(users.id, userId));

        await this.db
            .delete(emailVerificationTokens)
            .where(eq(emailVerificationTokens.userID, userId));

        const ttlMs = Number(this.config.getOrThrow('JWT_VERIFICATION_TTL_MS'));
        const expiresAt = new Date(Date.now() + ttlMs);

        const [tokenRecord] = await this.db
            .insert(emailVerificationTokens)
            .values({ userID: userId, expiresAt })
            .returning({ id: emailVerificationTokens.id });

        const token = await this.jwtService.signAsync(
            { sub: userId, jti: tokenRecord.id },
            {
                secret: this.config.getOrThrow('JWT_VERIFICATION_SECRET'),
                expiresIn: this.config.getOrThrow('JWT_VERIFICATION_EXPIRES_IN'),
            },
        );

        await this.mailService.sendEmailChangeEmail(dto.email, user.name, token);

        return { message: 'Mayhaps the email change verification link was sent, who knows' };
    }
}
