import { Inject, Injectable } from '@nestjs/common';
import { CreateLocalUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DRIZZLE } from '../database/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { users } from '../database/schema/users';
import { and, eq } from 'drizzle-orm';

@Injectable()
export class UsersService {
    constructor(@Inject(DRIZZLE) private db: NodePgDatabase<{ users: typeof users }>) {}

    async createLocalUser(dto: CreateLocalUserDto) {
        const [user] = await this.db
            .insert(users)
            .values({
                email: dto.email,
                name: dto.name,
                password: dto.password,
                provider: 'local',
            })
            .returning();
        return user;
    }

    async createOAuthUser(email: string, name: string, provider: string, providerId: string) {
        const [user] = await this.db
            .insert(users)
            .values({ email, name, provider, providerId })
            .returning();
        return user;
    }

    async findOne(id: string) {
        const [user] = await this.db.select().from(users).where(eq(users.id, id));
        return user ?? null;
    }

    async findByEmail(email: string) {
        const [user] = await this.db.select().from(users).where(eq(users.email, email));
        return user ?? null;
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        const [updatedUser] = await this.db
            .update(users)
            .set(updateUserDto)
            .where(eq(users.id, id))
            .returning();

        return updatedUser;
    }

    async findByProviderId(provider: string, providerId: string) {
        const [user] = await this.db
            .select()
            .from(users)
            .where(and(eq(users.provider, provider), eq(users.providerId, providerId)));
        return user ?? null;
    }

    remove(id: string) {
        return this.db.delete(users).where(eq(users.id, id));
    }
}
