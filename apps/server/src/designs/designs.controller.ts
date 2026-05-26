import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../types/auth.types';
import { DesignsService } from './designs.service';
import { CreateDesignDto } from './dto/create-design.dto';
import { UpdateDesignDto } from './dto/update-design.dto';
import { SaveCanvasDto } from './dto/save-canvas.dto';
import { SaveCheckpointDto } from './dto/save-checkpoint.dto';
import { UpdateCheckpointDto } from './dto/update-checkpoint.dto';

@Controller('designs')
export class DesignsController {
    constructor(private readonly designsService: DesignsService) {}

    @Get()
    list() {
        return this.designsService.listDesigns();
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@CurrentUser() user: AuthUser, @Body() dto: CreateDesignDto) {
        return this.designsService.createDesign(user.id, dto);
    }

    @UseGuards(OptionalJwtAuthGuard)
    @Get(':id')
    getOne(@CurrentUser() user: AuthUser | null, @Param('id') id: string) {
        return this.designsService.getDesign(id, user?.id ?? null);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateDesignDto) {
        return this.designsService.updateDesign(id, user.id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
        return this.designsService.deleteDesign(id, user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/fork')
    fork(@CurrentUser() user: AuthUser, @Param('id') id: string) {
        return this.designsService.forkDesign(id, user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/copy')
    copy(@CurrentUser() user: AuthUser, @Param('id') id: string) {
        return this.designsService.copyDesign(id, user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/share')
    generateShare(@CurrentUser() user: AuthUser, @Param('id') id: string) {
        return this.designsService.generateShareToken(id, user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id/share')
    @HttpCode(HttpStatus.NO_CONTENT)
    revokeShare(@CurrentUser() user: AuthUser, @Param('id') id: string) {
        return this.designsService.revokeShareToken(id, user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/canvas')
    saveCanvas(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: SaveCanvasDto) {
        return this.designsService.saveCanvas(id, user.id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/checkpoints')
    saveCheckpoint(
        @CurrentUser() user: AuthUser,
        @Param('id') id: string,
        @Body() dto: SaveCheckpointDto,
    ) {
        return this.designsService.saveCheckpoint(id, user.id, dto);
    }

    @UseGuards(OptionalJwtAuthGuard)
    @Get(':id/checkpoints')
    listCheckpoints(@CurrentUser() user: AuthUser | null, @Param('id') id: string) {
        return this.designsService.listCheckpoints(id, user?.id ?? null);
    }

    @UseGuards(OptionalJwtAuthGuard)
    @Get(':id/checkpoints/:cid')
    getCheckpoint(
        @CurrentUser() user: AuthUser | null,
        @Param('id') id: string,
        @Param('cid') cid: string,
    ) {
        return this.designsService.getCheckpoint(id, cid, user?.id ?? null);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/checkpoints/:cid')
    updateCheckpoint(
        @CurrentUser() user: AuthUser,
        @Param('id') id: string,
        @Param('cid') cid: string,
        @Body() dto: UpdateCheckpointDto,
    ) {
        return this.designsService.updateCheckpoint(id, cid, user.id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/checkpoints/:cid/restore')
    restoreCheckpoint(
        @CurrentUser() user: AuthUser,
        @Param('id') id: string,
        @Param('cid') cid: string,
    ) {
        return this.designsService.restoreCheckpoint(id, cid, user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id/checkpoints/:cid')
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteCheckpoint(
        @CurrentUser() user: AuthUser,
        @Param('id') id: string,
        @Param('cid') cid: string,
    ) {
        return this.designsService.deleteCheckpoint(id, cid, user.id);
    }
}
