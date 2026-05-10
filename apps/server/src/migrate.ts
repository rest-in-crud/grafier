import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { resolve } from 'path';

async function runMigrations() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URI,
    });

    await migrate(drizzle(pool), {
        migrationsFolder: resolve(__dirname, '../drizzle'),
    });

    await pool.end();
    console.log('Migrations applied successfully');
}

runMigrations().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
});
