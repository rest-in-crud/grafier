import { index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { projects } from './projects';

export const projectHistory = pgTable(
    'project_history',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        projectID: uuid('project_id')
            .references(() => projects.id, { onDelete: 'cascade' })
            .notNull(),
        label: text('label'),
        canvasJSON: jsonb('canvas_json').notNull(),
        layersJSON: jsonb('layers_json').notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
    },
    (table) => [
        index('history_project_id_idx').on(table.projectID),
        index('history_project_created_idx').on(table.projectID, table.createdAt),
    ],
);
