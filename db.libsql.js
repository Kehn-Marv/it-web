/*
db.libsql.js - Turso / libSQL adapter

Requires:
  npm install @libsql/client

Environment:
  TURSO_DATABASE_URL (or LIBSQL_DB_URL)
  TURSO_AUTH_TOKEN (optional)

Exports async functions: run, get, all, execute
*/
let client;
try {
  const lib = require('@libsql/client');
  const createClient = lib.createClient || (lib && lib.default && lib.default.createClient);
  const url = process.env.TURSO_DATABASE_URL || process.env.LIBSQL_DB_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN || process.env.LIBSQL_AUTH_TOKEN;
  if (!url) {
    throw new Error('TURSO_DATABASE_URL (or LIBSQL_DB_URL) is required to use db.libsql.js');
  }
  client = createClient({
    url,
    authToken
  });
} catch (e) {
  console.error('Failed to initialize @libsql/client. Did you install it? npm i @libsql/client');
  throw e;
}

async function execute(sqlOrObj) {
  return client.execute(sqlOrObj);
}

async function run(sql, params = []) {
  const res = await execute({ sql, args: params });
  return {
    rowsAffected: res.rowsAffected,
    lastInsertRowid: res.lastInsertRowid
  };
}

async function get(sql, params = []) {
  const res = await execute({ sql, args: params });
  if (!res || !res.rows) return null;
  return res.rows[0] || null;
}

async function all(sql, params = []) {
  const res = await execute({ sql, args: params });
  return res.rows || [];
}

module.exports = {
  client,
  execute,
  run,
  get,
  all
};
