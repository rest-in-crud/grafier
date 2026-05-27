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
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
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

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly designsService: DesignsService,
    ) {}

    @ApiOperation({ summary: 'Get a user by id' })
    @ApiBearerAuth('access-token')
    @ApiParam({ name: 'id', description: 'User id (uuid)' })
    @ApiResponse({ status: 200, description: 'User profile, or null if not found' })
    @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Param('id') id: string) {
        const user = await this.usersService.findOne(id);
        return user ? new UserResponseDto(user) : null;
    }

    @ApiOperation({ summary: 'Delete the current user account' })
    @ApiBearerAuth('access-token')
    @ApiParam({ name: 'id', description: 'User id (uuid); must match the caller' })
    @ApiResponse({ status: 204, description: 'Account deleted' })
    @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
    @ApiResponse({ status: 403, description: 'Caller is not the account owner' })
    @UseGuards(JwtAuthGuard, IsAccountOwnerGuard)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }

    @ApiOperation({ summary: 'Update the display name' })
    @ApiBearerAuth('access-token')
    @ApiParam({ name: 'id', description: 'User id (uuid); must match the caller' })
    @ApiResponse({ status: 200, description: 'Updated user' })
    @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
    @ApiResponse({ status: 403, description: 'Caller is not the account owner' })
    @ApiResponse({ status: 429, description: 'Too many requests' })
    @Throttle({ default: { ttl: 60_000, limit: 15 } })
    @UseGuards(JwtAuthGuard, IsAccountOwnerGuard)
    @Patch(':id/name')
    updateName(@Param('id') id: string, @Body() dto: UpdateNameDto) {
        return this.usersService.updateName(id, dto.name);
    }

    @ApiOperation({
        summary: 'Change the password',
        description:
            'Verifies the old password, rotates the credential, and clears the refresh cookie.',
    })
    @ApiBearerAuth('access-token')
    @ApiParam({ name: 'id', description: 'User id (uuid); must match the caller' })
    @ApiResponse({ status: 200, description: 'Password changed' })
    @ApiResponse({ status: 401, description: 'Missing or invalid access token, or wrong password' })
    @ApiResponse({ status: 403, description: 'Caller is not the account owner' })
    @ApiResponse({ status: 429, description: 'Too many requests' })
    @Throttle({ default: { ttl: 60_000, limit: 15 } })
    @UseGuards(JwtAuthGuard, IsAccountOwnerGuard)
    @Patch(':id/password')
    changePassword(
        @Param('id') id: string,
        @Body() dto: ChangePasswordDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        return this.usersService.changePassword(id, dto, res);
    }

    @ApiOperation({
        summary: 'Start an email change',
        description: 'Stores the pending email and sends a verification link to it.',
    })
    @ApiBearerAuth('access-token')
    @ApiParam({ name: 'id', description: 'User id (uuid); must match the caller' })
    @ApiResponse({ status: 200, description: 'Verification email queued to the pending address' })
    @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
    @ApiResponse({ status: 403, description: 'Caller is not the account owner' })
    @ApiResponse({ status: 409, description: 'Email already in use' })
    @ApiResponse({ status: 429, description: 'Too many requests' })
    @Throttle({ default: { ttl: 60_000, limit: 15 } })
    @UseGuards(JwtAuthGuard, IsAccountOwnerGuard)
    @Patch(':id/email')
    initiateEmailChange(@Param('id') id: string, @Body() dto: InitiateEmailChangeDto) {
        return this.usersService.initiateEmailChange(id, dto);
    }

    @ApiOperation({
        summary: "List a user's designs",
        description: 'Public designs are always visible; private designs only to the owner.',
    })
    @ApiParam({ name: 'id', description: 'User id (uuid)' })
    @ApiResponse({ status: 200, description: 'List of designs' })
    @UseGuards(OptionalJwtAuthGuard)
    @Get(':id/designs')
    listDesigns(@CurrentUser() user: AuthUser | null, @Param('id') id: string) {
        return this.designsService.listUserDesigns(id, user?.id ?? null);
    }

    @ApiOperation({ summary: "List a user's projects" })
    @ApiParam({ name: 'id', description: 'User id (uuid)' })
    @ApiResponse({ status: 200, description: 'List of projects' })
    @UseGuards(OptionalJwtAuthGuard)
    @Get(':id/projects')
    listProjects(@CurrentUser() user: AuthUser | null, @Param('id') id: string) {
        return this.designsService.listUserDesigns(id, user?.id ?? null, 'project');
    }

    @ApiOperation({ summary: "List a user's templates" })
    @ApiParam({ name: 'id', description: 'User id (uuid)' })
    @ApiResponse({ status: 200, description: 'List of templates' })
    @UseGuards(OptionalJwtAuthGuard)
    @Get(':id/templates')
    listTemplates(@CurrentUser() user: AuthUser | null, @Param('id') id: string) {
        return this.designsService.listUserDesigns(id, user?.id ?? null, 'template');
    }
}
