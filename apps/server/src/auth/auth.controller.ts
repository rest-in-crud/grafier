import { Body, Controller, Get, Post, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiCookieAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { GoogleGuard } from '@/auth/guards/google.guard';
import { GoogleCallbackFilter } from '@/auth/guards/google-callback.filter';
import { LocalGuard } from '@/auth/guards/local.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthUser } from '@/types/auth.types';
import { JwtAuthGuard } from './guards/jwtAuth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResetPasswordGuard } from './guards/reset-password.guard';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { EmailVerificationGuard } from './guards/email-verification.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @ApiOperation({
        summary: 'Register a local account',
        description: 'Creates a local-provider account and sends a verification email.',
    })
    @ApiResponse({ status: 201, description: 'Account created and verification email queued' })
    @ApiResponse({ status: 409, description: 'Email already in use' })
    @ApiResponse({ status: 429, description: 'Too many requests' })
    @Throttle({ default: { ttl: 60_000, limit: 15 } })
    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @ApiOperation({
        summary: 'Log in with email and password',
        description: 'Issues an access JWT and sets the httpOnly refresh cookie.',
    })
    @ApiBody({ type: LoginDto })
    @ApiResponse({ status: 201, description: 'Access token and current user' })
    @ApiResponse({ status: 401, description: 'Invalid credentials or unverified email' })
    @ApiResponse({ status: 429, description: 'Too many requests' })
    @Throttle({ default: { ttl: 60_000, limit: 15 } })
    @UseGuards(LocalGuard)
    @Post('login')
    login(@CurrentUser() user: AuthUser, @Res({ passthrough: true }) res: Response) {
        return this.authService.login(user, res);
    }

    @ApiOperation({
        summary: 'Refresh the access token',
        description: 'Rotates the refresh cookie and returns a fresh access token.',
    })
    @ApiCookieAuth('refresh-cookie')
    @ApiResponse({ status: 201, description: 'New access token' })
    @ApiResponse({ status: 401, description: 'Missing, invalid, or replayed refresh token' })
    @ApiResponse({ status: 429, description: 'Too many requests' })
    @Throttle({ default: { ttl: 60_000, limit: 90 } })
    @Post('refresh')
    refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        return this.authService.refresh(req, res);
    }

    @ApiOperation({
        summary: 'Get the current authenticated user',
    })
    @ApiBearerAuth('access-token')
    @ApiResponse({ status: 200, description: 'Current user profile' })
    @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
    @ApiResponse({ status: 429, description: 'Too many requests' })
    @Throttle({ default: { ttl: 60_000, limit: 90 } })
    @UseGuards(JwtAuthGuard)
    @Get('me')
    me(@CurrentUser() user: AuthUser) {
        return this.authService.me(user);
    }

    @ApiOperation({
        summary: 'Log out',
        description: 'Clears the refresh cookie and revokes the current session.',
    })
    @ApiCookieAuth('refresh-cookie')
    @ApiResponse({ status: 201, description: 'Logged out' })
    @Post('logout')
    logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        return this.authService.logout(req, res);
    }

    @ApiOperation({
        summary: 'Start Google OAuth flow',
        description: 'Redirects the browser to Google for consent.',
    })
    @ApiResponse({ status: 302, description: 'Redirect to Google' })
    @UseGuards(GoogleGuard)
    @Get('google')
    googleRedirect() {}

    @ApiOperation({
        summary: 'Google OAuth callback',
        description:
            'Completes the OAuth flow, links to an existing local account on email match, then redirects back to the frontend.',
    })
    @ApiResponse({ status: 302, description: 'Redirect back to the frontend' })
    @UseFilters(GoogleCallbackFilter)
    @UseGuards(GoogleGuard)
    @Get('google/callback')
    async googleCallback(@CurrentUser() user: AuthUser, @Req() req: Request, @Res() res: Response) {
        await this.authService.googleCallback(user, req, res);
    }

    @ApiOperation({
        summary: 'Request a password reset email',
        description: 'Always responds 201 to avoid leaking which emails are registered.',
    })
    @ApiResponse({ status: 201, description: 'Reset email queued if the account exists' })
    @ApiResponse({ status: 429, description: 'Too many requests' })
    @Throttle({ default: { ttl: 60_000, limit: 15 } })
    @Post('forgot-password')
    forgotPassword(@Body() dto: ForgotPasswordDto) {
        return this.authService.forgotPassword(dto);
    }

    @ApiOperation({
        summary: 'Reset the password with a token',
        description: 'The reset token is read from the `Authorization: Bearer <token>` header.',
    })
    @ApiBearerAuth('access-token')
    @ApiResponse({ status: 201, description: 'Password updated' })
    @ApiResponse({ status: 401, description: 'Invalid or expired reset token' })
    @ApiResponse({ status: 429, description: 'Too many requests' })
    @Throttle({ default: { ttl: 60_000, limit: 15 } })
    @UseGuards(ResetPasswordGuard)
    @Post('reset-password')
    resetPassword(
        @CurrentUser() payload: { id: string; jti: string },
        @Body() dto: ResetPasswordDto,
    ) {
        return this.authService.resetPassword(payload.id, payload.jti, dto);
    }

    @ApiOperation({
        summary: 'Send a verification email',
        description: 'Issues a fresh verification token and emails the link.',
    })
    @ApiResponse({ status: 201, description: 'Verification email queued' })
    @ApiResponse({ status: 429, description: 'Too many requests' })
    @Throttle({ default: { ttl: 60_000, limit: 15 } })
    @Post('verify-email')
    verifyEmail(@Body() dto: VerifyEmailDto) {
        return this.authService.sendVerification(dto);
    }

    @ApiOperation({
        summary: 'Confirm the email with a verification token',
        description:
            'The verification token is read from the `Authorization: Bearer <token>` header.',
    })
    @ApiBearerAuth('access-token')
    @ApiResponse({ status: 201, description: 'Email verified; user logged in' })
    @ApiResponse({ status: 401, description: 'Invalid or expired verification token' })
    @ApiResponse({ status: 429, description: 'Too many requests' })
    @Throttle({ default: { ttl: 60_000, limit: 15 } })
    @UseGuards(EmailVerificationGuard)
    @Post('confirm-email')
    confirmEmail(
        @CurrentUser() payload: { id: string; jti: string },
        @Res({ passthrough: true }) res: Response,
    ) {
        return this.authService.confirmEmail(payload.id, payload.jti, res);
    }
}
