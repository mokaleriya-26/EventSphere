import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations() {
  console.log(`[Migration] Connecting to MySQL at ${env.DB_HOST}:${env.DB_PORT} as user '${env.DB_USER}'...`);

  let initialConn;
  try {
    initialConn = await mysql.createConnection({
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      multipleStatements: true
    });
  } catch (connErr) {
    console.error('\n❌ [Migration Connection Error]:', connErr.message);
    if (connErr.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 Hint: MySQL rejected the credentials. Please verify DB_PASSWORD and DB_USER in backend/.env.');
    } else if (connErr.code === 'ECONNREFUSED') {
      console.error('💡 Hint: MySQL server is not running on localhost:3306. Start MySQL service first.');
    }
    process.exitCode = 1;
    throw connErr;
  }

  let dbConn;
  try {
    console.log(`[Migration] Ensuring database '${env.DB_NAME}' exists...`);
    await initialConn.query(
      `CREATE DATABASE IF NOT EXISTS \`${env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await initialConn.end();

    // Connect to the target database
    dbConn = await mysql.createConnection({
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      multipleStatements: true
    });

    // Ensure migration history tracking table exists
    await dbConn.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Fetch previously applied migrations
    const [appliedRows] = await dbConn.query('SELECT name FROM _migrations;');
    const appliedSet = new Set(appliedRows.map(r => r.name));

    const rootMigrationsDir = path.resolve(__dirname, '../../../database/migrations');
    const backendMigrationsDir = path.resolve(__dirname, '../../migrations');
    const migrationsDir = fs.existsSync(rootMigrationsDir) ? rootMigrationsDir : backendMigrationsDir;
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

    let newMigrationsCount = 0;
    for (const file of files) {
      if (appliedSet.has(file)) {
        console.log(`[Migration] Skipped (already applied): ${file}`);
        continue;
      }

      console.log(`[Migration] Executing migration: ${file}...`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await dbConn.query(sql);
      await dbConn.execute('INSERT INTO _migrations (name) VALUES (?)', [file]);
      console.log(`[Migration] Applied successfully: ${file}`);
      newMigrationsCount++;
    }

    await dbConn.end();
    console.log(`[Migration] All migrations completed successfully. (${newMigrationsCount} new, ${appliedSet.size} previously applied)`);
  } catch (err) {
    console.error('\n❌ [Migration Error]:', err.message);
    if (dbConn) {
      try { await dbConn.end(); } catch {}
    }
    process.exitCode = 1;
    throw err;
  }
}

// Allow direct CLI execution: node src/database/migrate.js
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
