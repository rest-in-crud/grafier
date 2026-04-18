import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { GoogleGuard } from '@/auth/guards/google.guard';
import { LocalGuard } from '@/auth/guards/local.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthUser } from '@/types/auth.types';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Throttle({ default: { ttl: 60_000, limit: 5 } })
    @Post('register')
    register(@Body() dto: RegisterDto, @Res() res: Response) {
        return this.authService.register(dto, res);
    }

    @Throttle({ default: { ttl: 60_000, limit: 5 } })
    @UseGuards(LocalGuard)
    @Post('login')
    login(@CurrentUser() user: AuthUser, @Res() res: Response) {
        return this.authService.login(user, res);
    }

    @Post('refresh')
    refresh(@Req() req: Request, @Res() res: Response) {
        return this.authService.refresh(req, res);
    }

    @Post('logout')
    logout(@Req() req: Request, @Res() res: Response) {
        return this.authService.logout(req, res);
    }

    @UseGuards(GoogleGuard)
    @Get('google')
    googleRedirect() {}

    @UseGuards(GoogleGuard)
    @Get('google/callback')
    googleCallback(@CurrentUser() user: AuthUser, @Res() res: Response) {
        return this.authService.googleCallback(user, res);
    }
}
