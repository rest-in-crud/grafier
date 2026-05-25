import {
    Controller,
    Get,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    HttpCode,
    HttpStatus,
    Res,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { UsersService } from './users.service';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateNameDto } from './dto/update-name.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { InitiateEmailChangeDto } from './dto/initiate-email-change.dto';
import { JwtAuthGuard } from '@/auth/guards/jwtAuth.guard';
import { OptionalJwtAuthGuard } from '@/auth/guards/optional-jwt.guard';
import { IsAccountOwnerGuard } from './guards/isAccountOwner.guard';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { AuthUser } from '@/types/auth.types';
import { DesignsService } from '@/designs/designs.service';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly designsService: DesignsService,
    ) {}

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Param('id') id: string) {
        const user = await this.usersService.findOne(id);
        return user ? new UserResponseDto(user) : null;
    }

    @UseGuards(JwtAuthGuard, IsAccountOwnerGuard)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }

    @Throttle({ default: { ttl: 60_000, limit: 5 } })
    @UseGuards(JwtAuthGuard, IsAccountOwnerGuard)
    @Patch(':id/name')
    updateName(@Param('id') id: string, @Body() dto: UpdateNameDto) {
        return this.usersService.updateName(id, dto.name);
    }

    @Throttle({ default: { ttl: 60_000, limit: 5 } })
    @UseGuards(JwtAuthGuard, IsAccountOwnerGuard)
    @Patch(':id/password')
    changePassword(
        @Param('id') id: string,
        @Body() dto: ChangePasswordDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        return this.usersService.changePassword(id, dto, res);
    }

    @Throttle({ default: { ttl: 60_000, limit: 5 } })
    @UseGuards(JwtAuthGuard, IsAccountOwnerGuard)
    @Patch(':id/email')
    initiateEmailChange(@Param('id') id: string, @Body() dto: InitiateEmailChangeDto) {
        return this.usersService.initiateEmailChange(id, dto);
    }

    @UseGuards(OptionalJwtAuthGuard)
    @Get(':id/designs')
    listDesigns(@CurrentUser() user: AuthUser | null, @Param('id') id: string) {
        return this.designsService.listUserDesigns(id, user?.id ?? null);
    }

    @UseGuards(OptionalJwtAuthGuard)
    @Get(':id/projects')
    listProjects(@CurrentUser() user: AuthUser | null, @Param('id') id: string) {
        return this.designsService.listUserDesigns(id, user?.id ?? null, 'project');
    }

    @UseGuards(OptionalJwtAuthGuard)
    @Get(':id/templates')
    listTemplates(@CurrentUser() user: AuthUser | null, @Param('id') id: string) {
        return this.designsService.listUserDesigns(id, user?.id ?? null, 'template');
    }
}
