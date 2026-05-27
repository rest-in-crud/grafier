import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DesignsService } from './designs.service';

@ApiTags('Shared designs')
@Controller('shared/designs')
export class SharedDesignsController {
    constructor(private readonly designsService: DesignsService) {}

    @ApiOperation({
        summary: 'Get a design by its share token',
        description:
            'Public endpoint used by social-media previews and recipients of a share link.',
    })
    @ApiParam({
        name: 'token',
        description: 'Opaque share token issued by POST /designs/:id/share',
    })
    @ApiResponse({ status: 200, description: 'Design with canvas and layers' })
    @ApiResponse({ status: 404, description: 'Token unknown or revoked' })
    @Get(':token')
    getSharedDesign(@Param('token') token: string) {
        return this.designsService.getDesignByShareToken(token);
    }
}
