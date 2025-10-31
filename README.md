# Device Inventory Backend (Express + SQLite / Turso)

This backend provides a production-ready REST API for an IT device inventory system.

Features:
- Auth (username/password) with HTTP-only JWT cookie
- CRUD for devices
- CSV import/export
- Workbooks (like separate Excel sheets)
- Audit logs (created/updated/deleted)
- Secure defaults and env-driven config
- SQLite for local/on-prem production or Turso/libSQL for managed remote DB

## Quick start (local SQLite)

1. Install dependencies
```bash
npm install
```

2. Copy `.env.example` to `.env` and edit values
```bash
cp .env.example .env
```

3. Run migrations to create the database and tables
```bash
npm run migrate
```

4. Start the server
```bash
npm start
```

API base: `http://localhost:3000/api`

Default admin:
- username: set in `.env` (default `itinventory`)
- password: set in `.env` (default `chl!@2025`)

## Turso / libSQL (optional)

To run this backend against a Turso / libSQL database:

1. Install the libSQL client
```bash
npm install @libsql/client
```

2. Set environment variables in `.env`:
```
USE_LIBSQL=true
TURSO_DATABASE_URL=libsql://<your-db-id>.turso.io
TURSO_AUTH_TOKEN=<your_token_here>
```

3. Run migrations:
```bash
npm run migrate
```

Notes:
- The adapter is `db.libsql.js`. `db.js` auto-selects the adapter based on `USE_LIBSQL`.
- Migrations will attempt to run the whole `migrations/init.sql`. If the remote rejects multiple statements in one execute, the migration runner will fall back to statement-by-statement execution.

## Security notes & production guidance

- This project uses HTTP-only cookies and JWTs for auth. For production:
  - Run behind HTTPS (TLS).
  - Use a strong `JWT_SECRET`.
  - Rotate secrets and consider a Secrets Manager for production.
  - Consider rate-limiting and IP allowlisting for public access.
  - Use backups for your DB (Turso provides backups; for SQLite back up the file).
