import { index, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

export const emailVerificationTokens = pgTable(
    'email_verification_tokens',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        userID: uuid('user_id')
            .references(() => users.id, { onDelete: 'cascade' })
            .notNull(),
        expiresAt: timestamp('expires_at').notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
    },
    (table) => [index('email_verification_tokens_user_id_idx').on(table.userID)],
);
