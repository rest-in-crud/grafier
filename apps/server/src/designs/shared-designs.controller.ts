import { Controller, Get, Param } from '@nestjs/common';
import { DesignsService } from './designs.service';

@Controller('shared/designs')
export class SharedDesignsController {
    constructor(private readonly designsService: DesignsService) {}

    @Get(':token')
    getSharedDesign(@Param('token') token: string) {
        return this.designsService.getDesignByShareToken(token);
    }
}
