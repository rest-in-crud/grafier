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
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
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

@ApiTags('Designs')
@Controller('designs')
export class DesignsController {
    constructor(private readonly designsService: DesignsService) {}

    @ApiOperation({ summary: 'List all public designs' })
    @ApiResponse({ status: 200, description: 'List of public designs' })
    @Get()
    list() {
        return this.designsService.listDesigns();
    }

    @ApiOperation({ summary: 'Create a design' })
    @ApiBearerAuth('access-token')
    @ApiResponse({ status: 201, description: 'Created design' })
    @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
    @UseGuards(JwtAuthGuard)
    @Post()
    create(@CurrentUser() user: AuthUser, @Body() dto: CreateDesignDto) {
        return this.designsService.createDesign(user.id, dto);
    }

    @ApiOperation({
        summary: 'Get a design by id',
        description: 'Owners always see their designs; others only if the design is public.',
    })
    @ApiParam({ name: 'id', description: 'Design id (uuid)' })
    @ApiResponse({ status: 200, description: 'Design with canvas and layers' })
    @ApiResponse({ status: 404, description: 'Design not found or not accessible' })
    @UseGuards(OptionalJwtAuthGuard)
    @Get(':id')
    getOne(@CurrentUser() user: AuthUser | null, @Param('id') id: string) {
        return this.designsService.getDesign(id, user?.id ?? null);
    }

    @ApiOperation({ summary: 'Update design metadata' })
    @ApiBearerAuth('access-token')
    @ApiParam({ name: 'id', description: 'Design id (uuid)' })
    @ApiResponse({ status: 200, description: 'Updated design' })
    @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
    @ApiResponse({ status: 403, description: 'Caller does not own this design' })
    @ApiResponse({ status: 404, description: 'Design not found' })
    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateDesignDto) {
        return this.designsService.updateDesign(id, user.id, dto);
    }

    @ApiOperation({ summary: 'Delete a design' })
    @ApiBearerAuth('access-token')
    @ApiParam({ name: 'id', description: 'Design id (uuid)' })
    @ApiResponse({ status: 204, description: 'Deleted' })
    @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
    @ApiResponse({ status: 403, description: 'Caller does not own this design' })
    @ApiResponse({ status: 404, description: 'Design not found' })
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
        return this.designsService.deleteDesign(id, user.id);
    }

    @ApiOperation({
        summary: "Fork a design into the caller's account",
        description: 'Accepts a share token via the `token` query parameter for private designs.',
    })
    @ApiBearerAuth('access-token')
    @ApiParam({ name: 'id', description: 'Source design id (uuid)' })
    @ApiQuery({ name: 'token', required: false, description: 'Share token for private designs' })
    @ApiResponse({ status: 201, description: 'Forked design' })
    @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
    @ApiResponse({ status: 403, description: 'Source design is private and no valid token given' })
    @ApiResponse({ status: 404, description: 'Source design not found' })
    @UseGuards(JwtAuthGuard)
    @Post(':id/fork')
    fork(@CurrentUser() user: AuthUser, @Param('id') id: string, @Query('token') token?: string) {
        return this.designsService.forkDesign(id, user.id, undefined, token);
    }

    @ApiOperation({ summary: 'Copy a design the caller owns' })
    @ApiBearerAuth('access-token')
    @ApiParam({ name: 'id', description: 'Source design id (uuid)' })
    @ApiResponse({ status: 201, description: 'Copied design' })
    @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
    @ApiResponse({ status: 403, description: 'Caller does not own this design' })
    @ApiResponse({ status: 404, description: 'Design not found' })
    @UseGuards(JwtAuthGuard)
    @Post(':id/copy')
    copy(@CurrentUser() user: AuthUser, @Param('id') id: string) {
        return this.designsService.copyDesign(id, user.id);
    }

    @ApiOperation({ summary: 'Generate a share token for a design' })
    @ApiBearerAuth('access-token')
    @ApiParam({ name: 'id', description: 'Design id (uuid)' })
    @ApiResponse({ status: 201, description: 'Share token issued' })
    @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
    @ApiResponse({ status: 403, description: 'Caller does not own this design' })
    @ApiResponse({ status: 404, description: 'Design not found' })
    @UseGuards(JwtAuthGuard)
    @Post(':id/share')
    generateShare(@CurrentUser() user: AuthUser, @Param('id') id: string) {
        return this.designsService.generateShareToken(id, user.id);
    }

    @ApiOperation({ summary: 'Revoke the share token for a design' })
    @ApiBearerAuth('access-token')
    @ApiParam({ name: 'id', description: 'Design id (uuid)' })
    @ApiResponse({ status: 204, description: 'Share token revoked' })
    @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
    @ApiResponse({ status: 403, description: 'Caller does not own this design' })
    @ApiResponse({ status: 404, description: 'Design not found' })
    @UseGuards(JwtAuthGuard)
    @Delete(':id/share')
    @HttpCode(HttpStatus.NO_CONTENT)
    revokeShare(@CurrentUser() user: AuthUser, @Param('id') id: string) {
        return this.designsService.revokeShareToken(id, user.id);
    }

    @ApiOperation({ summary: 'Save the current canvas state' })
    @ApiBearerAuth('access-token')
    @ApiParam({ name: 'id', description: 'Design id (uuid)' })
    @ApiResponse({ status: 201, description: 'Canvas saved' })
    @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
    @ApiResponse({ status: 403, description: 'Caller does not own this design' })
    @ApiResponse({ status: 404, description: 'Design not found' })
    @UseGuards(JwtAuthGuard)
    @Post(':id/canvas')
    saveCanvas(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: SaveCanvasDto) {
        return this.designsService.saveCanvas(id, user.id, dto);
    }

    @ApiOperation({ summary: 'Save a named checkpoint of the current canvas' })
    @ApiBearerAuth('access-token')
    @ApiParam({ name: 'id', description: 'Design id (uuid)' })
    @ApiResponse({ status: 201, description: 'Checkpoint saved' })
    @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
    @ApiResponse({ status: 403, description: 'Caller does not own this design' })
    @ApiResponse({ status: 404, description: 'Design not found' })
    @UseGuards(JwtAuthGuard)
    @Post(':id/checkpoints')
    saveCheckpoint(
        @CurrentUser() user: AuthUser,
        @Param('id') id: string,
        @Body() dto: SaveCheckpointDto,
    ) {
        return this.designsService.saveCheckpoint(id, user.id, dto);
    }

    @ApiOperation({ summary: 'List checkpoints for a design' })
    @ApiParam({ name: 'id', description: 'Design id (uuid)' })
    @ApiResponse({ status: 200, description: 'List of checkpoints (no canvas payload)' })
    @ApiResponse({ status: 404, description: 'Design not found or not accessible' })
    @UseGuards(OptionalJwtAuthGuard)
    @Get(':id/checkpoints')
    listCheckpoints(@CurrentUser() user: AuthUser | null, @Param('id') id: string) {
        return this.designsService.listCheckpoints(id, user?.id ?? null);
    }

    @ApiOperation({ summary: 'Get a single checkpoint with its canvas payload' })
    @ApiParam({ name: 'id', description: 'Design id (uuid)' })
    @ApiParam({ name: 'cid', description: 'Checkpoint id (uuid)' })
    @ApiResponse({ status: 200, description: 'Checkpoint with canvas and layers' })
    @ApiResponse({ status: 404, description: 'Checkpoint or design not found' })
    @UseGuards(OptionalJwtAuthGuard)
    @Get(':id/checkpoints/:cid')
    getCheckpoint(
        @CurrentUser() user: AuthUser | null,
        @Param('id') id: string,
        @Param('cid') cid: string,
    ) {
        return this.designsService.getCheckpoint(id, cid, user?.id ?? null);
    }

    @ApiOperation({ summary: 'Rename a checkpoint' })
    @ApiBearerAuth('access-token')
    @ApiParam({ name: 'id', description: 'Design id (uuid)' })
    @ApiParam({ name: 'cid', description: 'Checkpoint id (uuid)' })
    @ApiResponse({ status: 200, description: 'Updated checkpoint' })
    @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
    @ApiResponse({ status: 403, description: 'Caller does not own this design' })
    @ApiResponse({ status: 404, description: 'Checkpoint or design not found' })
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

    @ApiOperation({
        summary: 'Restore the canvas from a checkpoint',
        description: 'Replaces the live canvas with the checkpoint contents.',
    })
    @ApiBearerAuth('access-token')
    @ApiParam({ name: 'id', description: 'Design id (uuid)' })
    @ApiParam({ name: 'cid', description: 'Checkpoint id (uuid)' })
    @ApiResponse({ status: 201, description: 'Canvas restored' })
    @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
    @ApiResponse({ status: 403, description: 'Caller does not own this design' })
    @ApiResponse({ status: 404, description: 'Checkpoint or design not found' })
    @UseGuards(JwtAuthGuard)
    @Post(':id/checkpoints/:cid/restore')
    restoreCheckpoint(
        @CurrentUser() user: AuthUser,
        @Param('id') id: string,
        @Param('cid') cid: string,
    ) {
        return this.designsService.restoreCheckpoint(id, cid, user.id);
    }

    @ApiOperation({ summary: 'Delete a checkpoint' })
    @ApiBearerAuth('access-token')
    @ApiParam({ name: 'id', description: 'Design id (uuid)' })
    @ApiParam({ name: 'cid', description: 'Checkpoint id (uuid)' })
    @ApiResponse({ status: 204, description: 'Checkpoint deleted' })
    @ApiResponse({ status: 401, description: 'Missing or invalid access token' })
    @ApiResponse({ status: 403, description: 'Caller does not own this design' })
    @ApiResponse({ status: 404, description: 'Checkpoint or design not found' })
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
