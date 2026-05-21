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
    Put,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../types/auth.types';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { SaveCanvasDto } from './dto/save-canvas.dto';
import { SaveCheckpointDto } from './dto/save-checkpoint.dto';

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) {}

    @Get()
    list(@CurrentUser() user: AuthUser) {
        return this.projectsService.listProjects(user.id);
    }

    @Post()
    create(@CurrentUser() user: AuthUser, @Body() dto: CreateProjectDto) {
        return this.projectsService.createProject(user.id, dto);
    }

    @Get(':id')
    getOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
        return this.projectsService.getProject(id, user.id);
    }

    @Patch(':id')
    update(
        @CurrentUser() user: AuthUser,
        @Param('id') id: string,
        @Body() dto: UpdateProjectDto,
    ) {
        return this.projectsService.updateProject(id, user.id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
        return this.projectsService.deleteProject(id, user.id);
    }

    @Put(':id/canvas')
    saveCanvas(
        @CurrentUser() user: AuthUser,
        @Param('id') id: string,
        @Body() dto: SaveCanvasDto,
    ) {
        return this.projectsService.saveCanvas(id, user.id, dto);
    }

    @Post(':id/copy')
    copy(@CurrentUser() user: AuthUser, @Param('id') id: string) {
        return this.projectsService.copyProject(id, user.id);
    }

    @Post(':id/fork')
    fork(@CurrentUser() user: AuthUser, @Param('id') id: string) {
        return this.projectsService.forkProject(id, user.id);
    }

    @Post(':id/history')
    saveCheckpoint(
        @CurrentUser() user: AuthUser,
        @Param('id') id: string,
        @Body() dto: SaveCheckpointDto,
    ) {
        return this.projectsService.saveCheckpoint(id, user.id, dto);
    }

    @Get(':id/history')
    listHistory(@CurrentUser() user: AuthUser, @Param('id') id: string) {
        return this.projectsService.listHistory(id, user.id);
    }

    @Get(':id/history/:entryId')
    getHistoryEntry(
        @CurrentUser() user: AuthUser,
        @Param('id') id: string,
        @Param('entryId') entryId: string,
    ) {
        return this.projectsService.getHistoryEntry(id, entryId, user.id);
    }

    @Post(':id/history/:entryId/restore')
    restoreCheckpoint(
        @CurrentUser() user: AuthUser,
        @Param('id') id: string,
        @Param('entryId') entryId: string,
    ) {
        return this.projectsService.restoreCheckpoint(id, entryId, user.id);
    }

    @Delete(':id/history/:entryId')
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteHistoryEntry(
        @CurrentUser() user: AuthUser,
        @Param('id') id: string,
        @Param('entryId') entryId: string,
    ) {
        return this.projectsService.deleteHistoryEntry(id, entryId, user.id);
    }
}
