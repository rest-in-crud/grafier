import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from '@/auth/strategies/google.strategy';
import { LocalStrategy } from '@/auth/strategies/local.strategy';
import { JwtStrategy } from '@/auth/strategies/jwt.strategy';
import { LocalGuard } from '@/auth/guards/local.guard';
import { ResetPasswordStrategy } from './strategies/reset-password.strategy';
import { ResetPasswordGuard } from './guards/reset-password.guard';

@Module({
    imports: [UsersModule, JwtModule.register({}), PassportModule],
    providers: [
        AuthService,
        GoogleStrategy,
        LocalStrategy,
        JwtStrategy,
        ResetPasswordStrategy,
        LocalGuard,
        ResetPasswordGuard,
    ],
    controllers: [AuthController],
})
export class AuthModule {}
