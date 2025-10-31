const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const JWT_SECRET = process.env.JWT_SECRET || 'please-change-this-secret';
const ADMIN_USER = process.env.ADMIN_USER || 'itinventory';
const ADMIN_PASS = process.env.ADMIN_PASS || 'chl!@2025';

async function ensureAdmin() {
  const row = await db.get('SELECT id FROM users WHERE username = ?', [ADMIN_USER]);
  if (!row) {
    const hash = await bcrypt.hash(ADMIN_PASS, 10);
    const stmt = await db.run('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)', [ADMIN_USER, hash, 'admin']);
    console.log('Admin user created:', ADMIN_USER);
  } else {
    console.log('Admin user exists:', ADMIN_USER);
  }
}

async function initIfNeeded() {
  await ensureAdmin();
}

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  try {
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
    res.json({ message: 'ok', user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'logged out' });
});

module.exports = router;
module.exports.initIfNeeded = initIfNeeded;
