import {index, integer, pgTable, timestamp, uuid} from "drizzle-orm/pg-core";
import { users } from "./users";

export const sessions = pgTable('sessions', {
    id:        uuid('id').primaryKey().defaultRandom(),
    userID:    integer('user_id')
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    index('sessions_user_id_idx').on(table.userID),
]);