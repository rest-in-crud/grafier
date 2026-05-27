import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
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

@ApiTags('Templates')
@Controller('templates')
export class TemplatesAliasController {
    constructor(private readonly designsService: DesignsService) {}

    @ApiOperation({
        summary: 'List all public templates',
        description: 'Alias of GET /designs filtered by the `template` type.',
    })
    @ApiResponse({ status: 200, description: 'List of templates' })
    @Get()
    list() {
        return this.designsService.listDesigns('template');
    }

    @ApiOperation({ summary: "Fork a template into the caller's account" })
    @ApiBearerAuth('access-token')
    @ApiParam({ name: 'id', description: 'Source template id (uuid)' })
    @ApiQuery({ name: 'token', required: false, description: 'Share token for private templates' })
    @ApiResponse({ status: 201, description: 'Forked template' })
    @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
    @ApiResponse({
        status: 403,
        description: 'Source template is private and no valid token given',
    })
    @ApiResponse({ status: 404, description: 'Source template not found' })
    @UseGuards(JwtAuthGuard)
    @Post(':id/fork')
    fork(@CurrentUser() user: AuthUser, @Param('id') id: string, @Query('token') token?: string) {
        return this.designsService.forkDesign(id, user.id, 'template', token);
    }

    @ApiOperation({ summary: 'Copy a template the caller owns' })
    @ApiBearerAuth('access-token')
    @ApiParam({ name: 'id', description: 'Source template id (uuid)' })
    @ApiResponse({ status: 201, description: 'Copied template' })
    @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
    @ApiResponse({ status: 403, description: 'Caller does not own this template' })
    @ApiResponse({ status: 404, description: 'Template not found' })
    @UseGuards(JwtAuthGuard)
    @Post(':id/copy')
    copy(@CurrentUser() user: AuthUser, @Param('id') id: string) {
        return this.designsService.copyDesign(id, user.id, 'template');
    }
}
