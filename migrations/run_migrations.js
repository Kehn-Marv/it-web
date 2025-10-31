const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const useLibsql = process.env.USE_LIBSQL === 'true';
const sql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');

async function runLibsqlMigrations() {
  const { execute } = require('../db.libsql');
  console.log('Running migrations on libSQL/Turso via', process.env.TURSO_DATABASE_URL || process.env.LIBSQL_DB_URL);
  try {
    await execute(sql);
    console.log('Migrations executed successfully (single execute).');
  } catch (e) {
    console.log('Single execute failed, trying statement-by-statement...', e.message);
    const stmts = sql.split(/;\s*\n/).map(s => s.trim()).filter(Boolean);
    for (const stmt of stmts) {
      if (!stmt) continue;
      await execute({ sql: stmt, args: [] });
    }
    console.log('Migrations executed statement-by-statement.');
  }
}

function runSqliteMigrations() {
  const Database = require('better-sqlite3');
  const dbFile = process.env.SQLITE_FILE || './data/devices.db';
  console.log('Using SQLite DB file:', dbFile);
  const db = new Database(dbFile);
  db.exec(sql);
  db.close();
  console.log('Migrations executed successfully (SQLite).');
}

(async () => {
  if (useLibsql) {
    await runLibsqlMigrations();
  } else {
    runSqliteMigrations();
  }
})();
