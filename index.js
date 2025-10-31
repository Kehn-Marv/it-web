/*
Main entrypoint for Device Inventory backend
Run: npm install
Then: npm run migrate   # creates DB and tables (works for SQLite or Turso/libSQL)
Then: npm start
*/
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const authRoutes = require('./routes/auth');
const devicesRoutes = require('./routes/devices');
const workbooksRoutes = require('./routes/workbooks');

const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN;
const useLibsql = process.env.USE_LIBSQL === 'true';

const app = express();
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Configure CORS to support credentialed requests; do not use '*'
const defaultAllowedOrigins = [
  'http://localhost:3001',
  'http://localhost:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3000'
];

function parseAllowedOrigins(raw) {
  if (!raw) return defaultAllowedOrigins;
  if (Array.isArray(raw)) return raw;
  // Support comma-separated env var
  return String(raw)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

function normalizeOrigin(value) {
  if (!value) return '';
  try {
    const u = new URL(value);
    // Normalize to protocol://host:port without trailing slash or paths
    const port = u.port ? `:${u.port}` : '';
    return `${u.protocol}//${u.hostname}${port}`;
  } catch {
    // If not a valid URL, fallback to simple trim of trailing slash
    return value.replace(/\/$/, '');
  }
}

const allowedOrigins = parseAllowedOrigins(CORS_ORIGIN).map(normalizeOrigin);

app.use(cors({
  origin: (origin, callback) => {
    const normalized = normalizeOrigin(origin);
    if (!origin || allowedOrigins.includes(normalized)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use('/api/auth', authRoutes);
app.use('/api/devices', devicesRoutes);
app.use('/api/workbooks', workbooksRoutes);

// simple health
app.get('/health', (req, res) => res.json({ ok: true }));

async function start() {
  // If using libsql, ensure admin user exists (auth.js exports initIfNeeded)
  if (typeof authRoutes.initIfNeeded === 'function') {
    try {
      await authRoutes.initIfNeeded();
    } catch (e) {
      console.error('Failed to run initialization:', e);
    }
  }
  app.listen(PORT, () => {
    console.log(`Device Inventory backend listening on port ${PORT}`);
  });
}

start();
