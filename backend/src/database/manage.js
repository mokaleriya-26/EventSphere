import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import { env } from '../config/env.js';
import { runMigrations } from './migrate.js';
import { seedDatabase } from './seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../../');

async function getConnection() {
  return await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    multipleStatements: true
  });
}

export async function printDbStatus() {
  console.log('\n======================================================');
  console.log('📊 EventSpear Database Management Status');
  console.log('======================================================');
  console.log(`Host:     ${env.DB_HOST}:${env.DB_PORT}`);
  console.log(`Database: ${env.DB_NAME}`);
  console.log(`User:     ${env.DB_USER}`);
  console.log('------------------------------------------------------');

  let conn;
  try {
    conn = await getConnection();
    const [tables] = await conn.query('SHOW TABLES;');
    const tableNames = tables.map(t => Object.values(t)[0]);

    if (tableNames.length === 0) {
      console.log('⚠️ Database connected, but NO tables were found.');
      console.log('👉 Run "npm run db:reset" or "npm run migrate" to initialize.');
    } else {
      console.log(`✅ Status: Connected (${tableNames.length} tables found)\n`);
      console.log('TABLE NAME       | ROW COUNT');
      console.log('-----------------+----------');
      for (const table of tableNames) {
        const [rows] = await conn.query(`SELECT COUNT(*) as count FROM \`${table}\``);
        const count = rows[0].count;
        console.log(`${table.padEnd(16)} | ${count.toString().padStart(8)} rows`);
      }
    }
  } catch (err) {
    console.error('❌ Failed to connect to MySQL:', err.message);
  } finally {
    if (conn) await conn.end();
    console.log('======================================================\n');
  }
}

export async function resetDatabase() {
  console.log(`\n🔄 Resetting database '${env.DB_NAME}' from schema.sql and seed data...`);
  const initialConn = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    multipleStatements: true
  });

  const schemaPath = path.join(projectRoot, 'database/schema.sql');
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema file not found at ${schemaPath}`);
  }

  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  await initialConn.query(schemaSql);
  await initialConn.end();
  console.log('✅ Schema imported successfully.');

  // Run migrations tracking and seed
  await runMigrations();
  await seedDatabase();
  console.log('🎉 Database reset & reseed complete!\n');
}

export async function backupDatabase() {
  const backupsDir = path.join(projectRoot, 'database/backups');
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupsDir, `${env.DB_NAME}_backup_${timestamp}.sql`);

  console.log(`\n💾 Exporting database '${env.DB_NAME}' to ${backupFile}...`);

  const conn = await getConnection();
  const [tables] = await conn.query('SHOW TABLES;');
  const tableNames = tables.map(t => Object.values(t)[0]);

  let dumpContent = `-- EventSpear Database Backup\n-- Date: ${new Date().toISOString()}\n-- Database: ${env.DB_NAME}\n\n`;
  dumpContent += `CREATE DATABASE IF NOT EXISTS \`${env.DB_NAME}\`;\nUSE \`${env.DB_NAME}\`;\n\n`;

  for (const table of tableNames) {
    const [[createTable]] = await conn.query(`SHOW CREATE TABLE \`${table}\``);
    dumpContent += `DROP TABLE IF EXISTS \`${table}\`;\n`;
    dumpContent += `${createTable['Create Table']};\n\n`;

    const [rows] = await conn.query(`SELECT * FROM \`${table}\``);
    if (rows.length > 0) {
      for (const row of rows) {
        const columns = Object.keys(row).map(c => `\`${c}\``).join(', ');
        const values = Object.values(row).map(val => {
          if (val === null) return 'NULL';
          if (typeof val === 'number') return val;
          if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
          return `'${val.toString().replace(/'/g, "''")}'`;
        }).join(', ');
        dumpContent += `INSERT INTO \`${table}\` (${columns}) VALUES (${values});\n`;
      }
      dumpContent += '\n';
    }
  }

  await conn.end();
  fs.writeFileSync(backupFile, dumpContent, 'utf8');
  console.log(`✅ Backup successfully saved: ${backupFile}\n`);
}

// CLI handler
const action = process.argv[2] || 'status';

if (action === 'status') {
  printDbStatus().then(() => process.exit(0)).catch(() => process.exit(1));
} else if (action === 'reset') {
  resetDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
} else if (action === 'backup') {
  backupDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
} else {
  console.log(`Unknown action '${action}'. Available: status, reset, backup`);
  process.exit(1);
}
