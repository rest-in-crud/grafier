import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from '@/auth/dto/login.dto';
import { GoogleGuard } from '@/auth/guards/google.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('register')
    register(@Body() dto: RegisterDto, @Res() res: Response) {
        return this.authService.register(dto, res);
    }

    @Post('login')
    login(@Body() dto: LoginDto, @Res() res: Response) {
        return this.authService.login(dto, res);
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
    googleCallback(@Req() req: Request, @Res() res: Response) {
        return this.authService.googleCallback(req.user as Express.User, res);
    }
}
