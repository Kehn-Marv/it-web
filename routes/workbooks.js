const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

// List workbooks
router.get('/', requireAuth, async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM workbooks ORDER BY created_at DESC', []);
    res.json({ workbooks: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  try {
    const stmt = await db.run('INSERT INTO workbooks (name, created_by) VALUES (?, ?)', [name, req.user.username]);
    const id = stmt.lastInsertRowid;
    const wb = await db.get('SELECT * FROM workbooks WHERE id = ?', [id]);
    res.status(201).json(wb);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  const id = req.params.id;
  try {
    await db.run('DELETE FROM workbooks WHERE id = ?', [id]);
    res.json({ message: 'deleted' });
  } catch (err) {
    res.status(500).json({ error: 'internal' });
  }
});

module.exports = router;
