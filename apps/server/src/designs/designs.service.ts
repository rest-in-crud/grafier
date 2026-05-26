import { randomUUID } from 'crypto';
import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, count, desc, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import * as schema from '../database/schema';
import { designHistory, designs, users } from '../database/schema';
import { CreateDesignDto } from './dto/create-design.dto';
import { SaveCanvasDto } from './dto/save-canvas.dto';
import { SaveCheckpointDto } from './dto/save-checkpoint.dto';
import { UpdateCheckpointDto } from './dto/update-checkpoint.dto';
import { UpdateDesignDto } from './dto/update-design.dto';

const HISTORY_CAP = 50;

type Design = typeof designs.$inferSelect;

const designListFields = {
    id: designs.id,
    userID: designs.userID,
    userName: users.name,
    name: designs.name,
    width: designs.width,
    height: designs.height,
    isPublic: designs.isPublic,
    type: designs.type,
    shareToken: designs.shareToken,
    createdAt: designs.createdAt,
    updatedAt: designs.updatedAt,
} as const;

@Injectable()
export class DesignsService {
    constructor(@Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>) {}

    private omitShareToken<T extends { shareToken: string | null }>(
        design: T,
    ): Omit<T, 'shareToken'> {
        const { shareToken: _st, ...rest } = design;
        return rest as Omit<T, 'shareToken'>;
    }

    private async assertOwner(designId: string, userId: string): Promise<Design> {
        const [design] = await this.db.select().from(designs).where(eq(designs.id, designId));

        if (!design) throw new NotFoundException('Design not found');
        if (design.userID !== userId) throw new ForbiddenException('Access denied');

        return design;
    }

    private async assertAccessible(
        designId: string,
        userId: string | null,
        shareToken?: string,
    ): Promise<Design> {
        const [design] = await this.db.select().from(designs).where(eq(designs.id, designId));

        if (!design) throw new NotFoundException('Design not found');

        const allowed =
            design.isPublic ||
            design.userID === userId ||
            (shareToken !== undefined && design.shareToken === shareToken);

        if (!allowed) {
            throw new ForbiddenException('Access denied');
        }

        return design;
    }

    private assertNotFrozen(design: Design): void {
        if (design.type === 'template') {
            throw new ForbiddenException('Template designs are frozen');
        }
    }

    async listDesigns(type?: 'project' | 'template') {
        const conditions = type
            ? and(eq(designs.isPublic, true), eq(designs.type, type))
            : eq(designs.isPublic, true);

        const results = await this.db
            .select(designListFields)
            .from(designs)
            .innerJoin(users, eq(designs.userID, users.id))
            .where(conditions)
            .orderBy(desc(designs.updatedAt));

        return results.map((d) => this.omitShareToken(d));
    }

    async listUserDesigns(
        targetUserId: string,
        requesterId: string | null,
        type?: 'project' | 'template',
    ) {
        const isOwner = requesterId === targetUserId;

        const visibilityFilter = isOwner
            ? eq(designs.userID, targetUserId)
            : and(eq(designs.userID, targetUserId), eq(designs.isPublic, true));

        const conditions = type ? and(visibilityFilter, eq(designs.type, type)) : visibilityFilter;

        const results = await this.db
            .select(designListFields)
            .from(designs)
            .innerJoin(users, eq(designs.userID, users.id))
            .where(conditions)
            .orderBy(desc(designs.updatedAt));

        if (!isOwner) {
            return results.map((d) => this.omitShareToken(d));
        }

        return results;
    }

    async createDesign(userId: string, dto: CreateDesignDto) {
        const [design] = await this.db
            .insert(designs)
            .values({
                userID: userId,
                name: dto.name,
                width: dto.width ?? 1920,
                height: dto.height ?? 1080,
                isPublic: dto.isPublic ?? false,
                type: dto.type ?? 'project',
            })
            .returning();

        return design;
    }

    async getDesign(id: string, userId: string | null) {
        const [result] = await this.db
            .select({
                id: designs.id,
                userID: designs.userID,
                userName: users.name,
                name: designs.name,
                width: designs.width,
                height: designs.height,
                isPublic: designs.isPublic,
                type: designs.type,
                shareToken: designs.shareToken,
                canvasJSON: designs.canvasJSON,
                layersJSON: designs.layersJSON,
                createdAt: designs.createdAt,
                updatedAt: designs.updatedAt,
            })
            .from(designs)
            .innerJoin(users, eq(designs.userID, users.id))
            .where(eq(designs.id, id));

        if (!result) throw new NotFoundException('Design not found');

        if (!result.isPublic && result.userID !== userId) {
            throw new ForbiddenException('Access denied');
        }

        if (result.userID !== userId) {
            return this.omitShareToken(result);
        }

        return result;
    }

    async updateDesign(id: string, userId: string, dto: UpdateDesignDto) {
        const design = await this.assertOwner(id, userId);

        if (design.type === 'template') {
            const frozenKeys = Object.keys(dto).filter((k) => k !== 'name' && k !== 'isPublic');
            if (frozenKeys.length > 0) {
                throw new ForbiddenException(
                    'Template designs are frozen — only the name and visibility can be changed',
                );
            }

            if (dto.name === undefined && dto.isPublic === undefined) return design;

            const [updated] = await this.db
                .update(designs)
                .set({ name: dto.name, isPublic: dto.isPublic, updatedAt: new Date() })
                .where(eq(designs.id, id))
                .returning();

            return updated;
        }

        const [updated] = await this.db
            .update(designs)
            .set({ ...dto, updatedAt: new Date() })
            .where(eq(designs.id, id))
            .returning();

        return updated;
    }

    async deleteDesign(id: string, userId: string) {
        await this.assertOwner(id, userId);
        await this.db.delete(designs).where(eq(designs.id, id));
    }

    async saveCanvas(id: string, userId: string, dto: SaveCanvasDto) {
        const design = await this.assertOwner(id, userId);
        this.assertNotFrozen(design);

        const [updated] = await this.db
            .update(designs)
            .set({
                canvasJSON: dto.canvasJSON,
                layersJSON: dto.layersJSON,
                updatedAt: new Date(),
            })
            .where(eq(designs.id, id))
            .returning();

        return updated;
    }

    async forkDesign(
        id: string,
        userId: string,
        forcedType?: 'project' | 'template',
        shareToken?: string,
    ) {
        const source = await this.assertAccessible(id, userId, shareToken);

        const [fork] = await this.db
            .insert(designs)
            .values({
                userID: userId,
                name: `${source.name} (fork)`,
                width: source.width,
                height: source.height,
                isPublic: false,
                type: forcedType ?? source.type,
                canvasJSON: source.canvasJSON ?? undefined,
                layersJSON: source.layersJSON ?? undefined,
            })
            .returning();

        const entries = await this.db
            .select()
            .from(designHistory)
            .where(eq(designHistory.designID, id))
            .orderBy(asc(designHistory.createdAt));

        if (entries.length > 0) {
            await this.db.insert(designHistory).values(
                entries.map((e) => ({
                    designID: fork.id,
                    label: e.label,
                    canvasJSON: e.canvasJSON as Record<string, unknown>,
                    layersJSON: e.layersJSON as Record<string, unknown>,
                    createdAt: e.createdAt,
                })),
            );
        }

        return fork;
    }

    async copyDesign(id: string, userId: string, forcedType?: 'project' | 'template') {
        const source = await this.assertAccessible(id, userId);

        const [copy] = await this.db
            .insert(designs)
            .values({
                userID: userId,
                name: `${source.name} (copy)`,
                width: source.width,
                height: source.height,
                isPublic: false,
                type: forcedType ?? source.type,
                canvasJSON: source.canvasJSON ?? undefined,
                layersJSON: source.layersJSON ?? undefined,
            })
            .returning();

        return copy;
    }

    async saveCheckpoint(id: string, userId: string, dto: SaveCheckpointDto) {
        const design = await this.assertOwner(id, userId);
        this.assertNotFrozen(design);

        const [{ total }] = await this.db
            .select({ total: count() })
            .from(designHistory)
            .where(eq(designHistory.designID, id));

        if (total >= HISTORY_CAP) {
            const [oldest] = await this.db
                .select({ id: designHistory.id })
                .from(designHistory)
                .where(eq(designHistory.designID, id))
                .orderBy(asc(designHistory.createdAt))
                .limit(1);

            if (oldest) {
                await this.db.delete(designHistory).where(eq(designHistory.id, oldest.id));
            }
        }

        const [entry] = await this.db
            .insert(designHistory)
            .values({
                designID: id,
                label: dto.label,
                canvasJSON: dto.canvasJSON,
                layersJSON: dto.layersJSON,
            })
            .returning();

        await this.db
            .update(designs)
            .set({
                canvasJSON: dto.canvasJSON,
                layersJSON: dto.layersJSON,
                updatedAt: new Date(),
            })
            .where(eq(designs.id, id));

        return entry;
    }

    async listCheckpoints(id: string, userId: string | null) {
        await this.assertAccessible(id, userId);

        return this.db
            .select({
                id: designHistory.id,
                designID: designHistory.designID,
                label: designHistory.label,
                createdAt: designHistory.createdAt,
            })
            .from(designHistory)
            .where(eq(designHistory.designID, id))
            .orderBy(asc(designHistory.createdAt));
    }

    async getCheckpoint(id: string, checkpointId: string, userId: string | null) {
        await this.assertAccessible(id, userId);

        const [entry] = await this.db
            .select()
            .from(designHistory)
            .where(and(eq(designHistory.id, checkpointId), eq(designHistory.designID, id)));

        if (!entry) throw new NotFoundException('Checkpoint not found');

        return entry;
    }

    async updateCheckpoint(
        id: string,
        checkpointId: string,
        userId: string,
        dto: UpdateCheckpointDto,
    ) {
        const design = await this.assertOwner(id, userId);
        this.assertNotFrozen(design);

        const [entry] = await this.db
            .select()
            .from(designHistory)
            .where(and(eq(designHistory.id, checkpointId), eq(designHistory.designID, id)));

        if (!entry) throw new NotFoundException('Checkpoint not found');

        const [updated] = await this.db
            .update(designHistory)
            .set({ label: dto.label })
            .where(eq(designHistory.id, checkpointId))
            .returning();

        return updated;
    }

    async restoreCheckpoint(id: string, checkpointId: string, userId: string) {
        const design = await this.assertOwner(id, userId);
        this.assertNotFrozen(design);

        const entry = await this.getCheckpoint(id, checkpointId, userId);

        const [updated] = await this.db
            .update(designs)
            .set({
                canvasJSON: entry.canvasJSON as Record<string, unknown>,
                layersJSON: entry.layersJSON as Record<string, unknown>,
                updatedAt: new Date(),
            })
            .where(eq(designs.id, id))
            .returning();

        return updated;
    }

    async deleteCheckpoint(id: string, checkpointId: string, userId: string) {
        await this.assertOwner(id, userId);

        const [entry] = await this.db
            .select()
            .from(designHistory)
            .where(and(eq(designHistory.id, checkpointId), eq(designHistory.designID, id)));

        if (!entry) throw new NotFoundException('Checkpoint not found');

        await this.db
            .delete(designHistory)
            .where(and(eq(designHistory.id, checkpointId), eq(designHistory.designID, id)));
    }

    async generateShareToken(designId: string, userId: string) {
        await this.assertOwner(designId, userId);

        const token = randomUUID();

        const [updated] = await this.db
            .update(designs)
            .set({ shareToken: token, updatedAt: new Date() })
            .where(eq(designs.id, designId))
            .returning({ shareToken: designs.shareToken });

        return updated;
    }

    async revokeShareToken(designId: string, userId: string) {
        await this.assertOwner(designId, userId);

        await this.db
            .update(designs)
            .set({ shareToken: null, updatedAt: new Date() })
            .where(eq(designs.id, designId));
    }

    async getDesignByShareToken(shareToken: string) {
        const [result] = await this.db
            .select({
                id: designs.id,
                userID: designs.userID,
                userName: users.name,
                name: designs.name,
                width: designs.width,
                height: designs.height,
                isPublic: designs.isPublic,
                type: designs.type,
                canvasJSON: designs.canvasJSON,
                layersJSON: designs.layersJSON,
                createdAt: designs.createdAt,
                updatedAt: designs.updatedAt,
            })
            .from(designs)
            .innerJoin(users, eq(designs.userID, users.id))
            .where(eq(designs.shareToken, shareToken));

        if (!result) throw new NotFoundException('Design not found');

        return result;
    }
}
