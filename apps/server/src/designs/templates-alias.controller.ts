import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../types/auth.types';
import { DesignsService } from './designs.service';

@Controller('templates')
export class TemplatesAliasController {
    constructor(private readonly designsService: DesignsService) {}

    @UseGuards(OptionalJwtAuthGuard)
    @Get()
    list(@CurrentUser() user: AuthUser | null) {
        return this.designsService.listDesigns(user?.id ?? null, 'template');
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/fork')
    fork(@CurrentUser() user: AuthUser, @Param('id') id: string) {
        return this.designsService.forkDesign(id, user.id, 'template');
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/copy')
    copy(@CurrentUser() user: AuthUser, @Param('id') id: string) {
        return this.designsService.copyDesign(id, user.id, 'template');
    }
}
