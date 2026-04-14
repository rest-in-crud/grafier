import { pgTable, serial, text } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    provider: text('provider').default('local'),
    password: text(''),
});
