import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { GoogleGuard } from '@/auth/guards/google.guard';
import { LocalGuard } from '@/auth/guards/local.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthUser } from '@/types/auth.types';
import { JwtAuthGuard } from './guards/jwtAuth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResetPasswordGuard } from './guards/reset-password.guard';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { EmailVerificationGuard } from './guards/email-verification.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Throttle({ default: { ttl: 60_000, limit: 5 } })
    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Throttle({ default: { ttl: 60_000, limit: 5 } })
    @UseGuards(LocalGuard)
    @Post('login')
    login(@CurrentUser() user: AuthUser, @Res({ passthrough: true }) res: Response) {
        return this.authService.login(user, res);
    }

    @Throttle({ default: { ttl: 60_000, limit: 30 } })
    @Post('refresh')
    refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        return this.authService.refresh(req, res);
    }

    @Throttle({ default: { ttl: 60_000, limit: 5 } })
    @UseGuards(JwtAuthGuard)
    @Get('me')
    me(@CurrentUser() user: AuthUser) {
        return this.authService.me(user);
    }

    @Post('logout')
    logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        return this.authService.logout(req, res);
    }

    @UseGuards(GoogleGuard)
    @Get('google')
    googleRedirect() {}

    @UseGuards(GoogleGuard)
    @Get('google/callback')
    async googleCallback(@CurrentUser() user: AuthUser, @Res() res: Response) {
        await this.authService.googleCallback(user, res);
    }

    @Throttle({ default: { ttl: 60_000, limit: 5 } })
    @Post('forgot-password')
    forgotPassword(@Body() dto: ForgotPasswordDto) {
        return this.authService.forgotPassword(dto);
    }

    @Throttle({ default: { ttl: 60_000, limit: 5 } })
    @UseGuards(ResetPasswordGuard)
    @Post('reset-password')
    resetPassword(
        @CurrentUser() payload: { id: string; jti: string },
        @Body() dto: ResetPasswordDto,
    ) {
        return this.authService.resetPassword(payload.id, payload.jti, dto);
    }

    @Throttle({ default: { ttl: 60_000, limit: 5 } })
    @Post('verify-email')
    verifyEmail(@Body() dto: VerifyEmailDto) {
        return this.authService.sendVerification(dto);
    }

    @Throttle({ default: { ttl: 60_000, limit: 5 } })
    @UseGuards(EmailVerificationGuard)
    @Post('confirm-email')
    confirmEmail(@CurrentUser() payload: { id: string; jti: string }) {
        return this.authService.confirmEmail(payload.id, payload.jti);
    }
}
