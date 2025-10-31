/*
db.js - unified DB adapter.
If USE_LIBSQL=true, uses db.libsql.js (async).
Otherwise uses better-sqlite3 but exposes async functions for compatibility.
*/
const useLibsql = process.env.USE_LIBSQL === 'true';

if (useLibsql) {
  module.exports = require('./db.libsql');
} else {
  const Database = require('better-sqlite3');
  const fs = require('fs');
  const path = require('path');
  const dbFile = process.env.SQLITE_FILE || path.join(__dirname, 'data', 'devices.db');
  const dataDir = require('path').dirname(dbFile);
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const db = new Database(dbFile);

  function runSync(sql, params = []) {
    const stmt = db.prepare(sql);
    const info = stmt.run(...params);
    return info;
  }

  function getSync(sql, params = []) {
    const stmt = db.prepare(sql);
    return stmt.get(...params);
  }

  function allSync(sql, params = []) {
    const stmt = db.prepare(sql);
    return stmt.all(...params);
  }

  // Wrap sync functions in async to keep API consistent
  module.exports = {
    db,
    run: async (sql, params=[]) => runSync(sql, params),
    get: async (sql, params=[]) => getSync(sql, params),
    all: async (sql, params=[]) => allSync(sql, params)
  };
}
