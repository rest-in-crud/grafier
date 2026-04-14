import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from '@/auth/strategies/google.strategy';

@Module({
    imports: [UsersModule, JwtModule.register({}), PassportModule],
    providers: [AuthService, GoogleStrategy],
    controllers: [AuthController],
})
export class AuthModule {}
