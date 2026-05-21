import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, count, desc, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import * as schema from '../database/schema';
import { projectHistory, projects } from '../database/schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { SaveCanvasDto } from './dto/save-canvas.dto';
import { SaveCheckpointDto } from './dto/save-checkpoint.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

const HISTORY_CAP = 50;

@Injectable()
export class ProjectsService {
    constructor(@Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>) {}

    private async assertOwner(projectId: string, userId: string) {
        const [project] = await this.db.select().from(projects).where(eq(projects.id, projectId));

        if (!project) throw new NotFoundException('Project not found');
        if (project.userID !== userId) throw new ForbiddenException('Access denied');

        return project;
    }

    async listProjects(userId: string) {
        return this.db
            .select({
                id: projects.id,
                name: projects.name,
                width: projects.width,
                height: projects.height,
                createdAt: projects.createdAt,
                updatedAt: projects.updatedAt,
            })
            .from(projects)
            .where(eq(projects.userID, userId))
            .orderBy(desc(projects.updatedAt));
    }

    async createProject(userId: string, dto: CreateProjectDto) {
        const [project] = await this.db
            .insert(projects)
            .values({
                userID: userId,
                name: dto.name,
                width: dto.width ?? 1920,
                height: dto.height ?? 1080,
            })
            .returning();

        return project;
    }

    async getProject(id: string, userId: string) {
        return this.assertOwner(id, userId);
    }

    async updateProject(id: string, userId: string, dto: UpdateProjectDto) {
        await this.assertOwner(id, userId);

        const [updated] = await this.db
            .update(projects)
            .set({ ...dto, updatedAt: new Date() })
            .where(eq(projects.id, id))
            .returning();

        return updated;
    }

    async deleteProject(id: string, userId: string) {
        await this.assertOwner(id, userId);
        await this.db.delete(projects).where(eq(projects.id, id));
    }

    async saveCanvas(id: string, userId: string, dto: SaveCanvasDto) {
        await this.assertOwner(id, userId);

        const [updated] = await this.db
            .update(projects)
            .set({
                canvasJSON: dto.canvasJSON,
                layersJSON: dto.layersJSON,
                updatedAt: new Date(),
            })
            .where(eq(projects.id, id))
            .returning();

        return updated;
    }

    async copyProject(id: string, userId: string) {
        const source = await this.assertOwner(id, userId);

        const [copy] = await this.db
            .insert(projects)
            .values({
                userID: userId,
                name: `${source.name} (copy)`,
                width: source.width,
                height: source.height,
                canvasJSON: source.canvasJSON ?? undefined,
                layersJSON: source.layersJSON ?? undefined,
            })
            .returning();

        return copy;
    }

    async forkProject(id: string, userId: string) {
        const source = await this.assertOwner(id, userId);

        const [fork] = await this.db
            .insert(projects)
            .values({
                userID: userId,
                name: `${source.name} (fork)`,
                width: source.width,
                height: source.height,
                canvasJSON: source.canvasJSON ?? undefined,
                layersJSON: source.layersJSON ?? undefined,
            })
            .returning();

        const entries = await this.db
            .select()
            .from(projectHistory)
            .where(eq(projectHistory.projectID, id))
            .orderBy(asc(projectHistory.createdAt));

        if (entries.length > 0) {
            await this.db.insert(projectHistory).values(
                entries.map((e) => ({
                    projectID: fork.id,
                    label: e.label,
                    canvasJSON: e.canvasJSON as Record<string, unknown>,
                    layersJSON: e.layersJSON as Record<string, unknown>,
                    createdAt: e.createdAt,
                })),
            );
        }

        return fork;
    }

    async saveCheckpoint(id: string, userId: string, dto: SaveCheckpointDto) {
        await this.assertOwner(id, userId);

        const [{ total }] = await this.db
            .select({ total: count() })
            .from(projectHistory)
            .where(eq(projectHistory.projectID, id));

        if (total >= HISTORY_CAP) {
            const [oldest] = await this.db
                .select({ id: projectHistory.id })
                .from(projectHistory)
                .where(eq(projectHistory.projectID, id))
                .orderBy(asc(projectHistory.createdAt))
                .limit(1);

            if (oldest) {
                await this.db.delete(projectHistory).where(eq(projectHistory.id, oldest.id));
            }
        }

        const [entry] = await this.db
            .insert(projectHistory)
            .values({
                projectID: id,
                label: dto.label,
                canvasJSON: dto.canvasJSON,
                layersJSON: dto.layersJSON,
            })
            .returning();

        await this.db
            .update(projects)
            .set({
                canvasJSON: dto.canvasJSON,
                layersJSON: dto.layersJSON,
                updatedAt: new Date(),
            })
            .where(eq(projects.id, id));

        return entry;
    }

    async listHistory(id: string, userId: string) {
        await this.assertOwner(id, userId);

        return this.db
            .select({
                id: projectHistory.id,
                projectID: projectHistory.projectID,
                label: projectHistory.label,
                createdAt: projectHistory.createdAt,
            })
            .from(projectHistory)
            .where(eq(projectHistory.projectID, id))
            .orderBy(asc(projectHistory.createdAt));
    }

    async getHistoryEntry(id: string, entryId: string, userId: string) {
        await this.assertOwner(id, userId);

        const [entry] = await this.db
            .select()
            .from(projectHistory)
            .where(and(eq(projectHistory.id, entryId), eq(projectHistory.projectID, id)));

        if (!entry) throw new NotFoundException('History entry not found');

        return entry;
    }

    async restoreCheckpoint(id: string, entryId: string, userId: string) {
        const entry = await this.getHistoryEntry(id, entryId, userId);

        const [updated] = await this.db
            .update(projects)
            .set({
                canvasJSON: entry.canvasJSON as Record<string, unknown>,
                layersJSON: entry.layersJSON as Record<string, unknown>,
                updatedAt: new Date(),
            })
            .where(eq(projects.id, id))
            .returning();

        return updated;
    }

    async deleteHistoryEntry(id: string, entryId: string, userId: string) {
        await this.getHistoryEntry(id, entryId, userId);

        await this.db
            .delete(projectHistory)
            .where(and(eq(projectHistory.id, entryId), eq(projectHistory.projectID, id)));
    }
}
