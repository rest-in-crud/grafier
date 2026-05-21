import { index, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

export const projects = pgTable(
    'projects',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        userID: uuid('user_id')
            .references(() => users.id, { onDelete: 'cascade' })
            .notNull(),
        name: text('name').notNull(),
        width: integer('width').notNull().default(1920),
        height: integer('height').notNull().default(1080),
        canvasJSON: jsonb('canvas_json'),
        layersJSON: jsonb('layers_json'),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().notNull(),
    },
    (table) => [index('projects_user_id_idx').on(table.userID)],
);
