import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { resolve } from 'path';

async function runMigrations() {
    const pool = new Pool({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
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
