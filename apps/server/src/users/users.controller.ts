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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
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
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }

    @UseGuards(JwtAuthGuard, IsAccountOwnerGuard)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
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
