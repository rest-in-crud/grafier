import { index, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { designs } from './designs';

export const designHistory = pgTable(
    'design_history',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        designID: uuid('design_id')
            .references(() => designs.id, { onDelete: 'cascade' })
            .notNull(),
        label: text('label'),
        width: integer('width').notNull().default(1920),
        height: integer('height').notNull().default(1080),
        canvasJSON: jsonb('canvas_json').notNull(),
        layersJSON: jsonb('layers_json').notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
    },
    (table) => [
        index('history_design_id_idx').on(table.designID),
        index('history_design_created_idx').on(table.designID, table.createdAt),
    ],
);
