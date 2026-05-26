import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../types/auth.types';
import { DesignsService } from './designs.service';
import { CreateDesignDto } from './dto/create-design.dto';

@Controller('projects')
export class ProjectsAliasController {
    constructor(private readonly designsService: DesignsService) {}

    @Get()
    list() {
        return this.designsService.listDesigns('project');
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@CurrentUser() user: AuthUser, @Body() dto: CreateDesignDto) {
        return this.designsService.createDesign(user.id, { ...dto, type: 'project' });
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/fork')
    fork(@CurrentUser() user: AuthUser, @Param('id') id: string, @Query('token') token?: string) {
        return this.designsService.forkDesign(id, user.id, 'project', token);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/copy')
    copy(@CurrentUser() user: AuthUser, @Param('id') id: string) {
        return this.designsService.copyDesign(id, user.id, 'project');
    }
}
