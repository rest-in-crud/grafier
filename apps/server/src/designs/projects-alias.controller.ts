import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../types/auth.types';
import { DesignsService } from './designs.service';
import { CreateDesignDto } from './dto/create-design.dto';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsAliasController {
    constructor(private readonly designsService: DesignsService) {}

    @ApiOperation({
        summary: 'List all public projects',
        description: 'Alias of GET /designs filtered by the `project` type.',
    })
    @ApiResponse({ status: 200, description: 'List of projects' })
    @Get()
    list() {
        return this.designsService.listDesigns('project');
    }

    @ApiOperation({
        summary: 'Create a project',
        description: 'Alias of POST /designs that pins the type to `project`.',
    })
    @ApiBearerAuth('access-token')
    @ApiResponse({ status: 201, description: 'Created project' })
    @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
    @UseGuards(JwtAuthGuard)
    @Post()
    create(@CurrentUser() user: AuthUser, @Body() dto: CreateDesignDto) {
        return this.designsService.createDesign(user.id, { ...dto, type: 'project' });
    }

    @ApiOperation({ summary: "Fork a project into the caller's account" })
    @ApiBearerAuth('access-token')
    @ApiParam({ name: 'id', description: 'Source project id (uuid)' })
    @ApiQuery({ name: 'token', required: false, description: 'Share token for private projects' })
    @ApiResponse({ status: 201, description: 'Forked project' })
    @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
    @ApiResponse({ status: 403, description: 'Source project is private and no valid token given' })
    @ApiResponse({ status: 404, description: 'Source project not found' })
    @UseGuards(JwtAuthGuard)
    @Post(':id/fork')
    fork(@CurrentUser() user: AuthUser, @Param('id') id: string, @Query('token') token?: string) {
        return this.designsService.forkDesign(id, user.id, 'project', token);
    }

    @ApiOperation({ summary: 'Copy a project the caller owns' })
    @ApiBearerAuth('access-token')
    @ApiParam({ name: 'id', description: 'Source project id (uuid)' })
    @ApiResponse({ status: 201, description: 'Copied project' })
    @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
    @ApiResponse({ status: 403, description: 'Caller does not own this project' })
    @ApiResponse({ status: 404, description: 'Project not found' })
    @UseGuards(JwtAuthGuard)
    @Post(':id/copy')
    copy(@CurrentUser() user: AuthUser, @Param('id') id: string) {
        return this.designsService.copyDesign(id, user.id, 'project');
    }
}
