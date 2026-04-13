import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DRIZZLE } from '../database/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { users } from '../database/schema/users';
import { eq } from 'drizzle-orm';

@Injectable()
export class UsersService {
    constructor(@Inject(DRIZZLE) private db: NodePgDatabase<{ users: typeof users }>) {}

    async create(createUserDto: CreateUserDto) {
        const [user] = await this.db
            .insert(users)
            .values(createUserDto as typeof users.$inferInsert)
            .returning();
        return user;
    }

    async findAll() {
        return this.db.select().from(users);
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

    remove(id: string) {
        return this.db.delete(users).where(eq(users.id, id));
    }
}
