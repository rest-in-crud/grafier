import { boolean, pgTable, text, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    provider: text('provider').default('local'),
    providerId: text('provider_id'),
    password: text('password'),
    isVerified: boolean('is_verified').default(false).notNull(),
    pendingEmail: text('pending_email'),
});
