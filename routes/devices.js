const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const db = require('../db');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { requireAuth } = require('../middleware/auth');
const upload = multer({ dest: 'tmp/' });

function buildSearchQuery(q) {
  const qv = `%${q}%`;
  return {
    clause: '(device_model LIKE ? OR serial_number LIKE ? OR owner_name LIKE ? OR location LIKE ? OR category LIKE ?)',
    params: [qv, qv, qv, qv, qv]
  };
}

// List + search + paging
router.get('/', requireAuth, async (req, res) => {
  const { q, workbook, limit = 100, offset = 0 } = req.query;
  let base = 'SELECT * FROM devices';
  const clauses = [];
  const params = [];
  if (workbook) {
    clauses.push('workbook = ?');
    params.push(workbook);
  }
  if (q) {
    const s = buildSearchQuery(q);
    clauses.push(s.clause);
    params.push(...s.params);
  }
  if (clauses.length) base += ' WHERE ' + clauses.join(' AND ');
  base += ' ORDER BY updated_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));
  try {
    const rows = await db.all(base, params);
    res.json({ devices: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

// Get single
router.get('/:id', requireAuth, async (req, res) => {
  const id = req.params.id;
  try {
    const row = await db.get('SELECT * FROM devices WHERE id = ?', [id]);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

// Create
router.post('/', requireAuth, async (req, res) => {
  const { device_model, serial_number, owner_name, date_enrolled, next_maintenance, location, category, color_tag, workbook, notes } = req.body;
  try {
    const stmt = await db.run(
      `INSERT INTO devices (device_model, serial_number, owner_name, date_enrolled, next_maintenance, location, category, color_tag, workbook, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [device_model, serial_number, owner_name, date_enrolled, next_maintenance, location, category, color_tag, workbook, notes]
    );
    const deviceId = stmt.lastInsertRowid;
    await db.run('INSERT INTO audit_logs (device_id, action, performed_by, details) VALUES (?, ?, ?, ?)', [deviceId, 'created', req.user.username, JSON.stringify(req.body)]);
    const device = await db.get('SELECT * FROM devices WHERE id = ?', [deviceId]);
    res.status(201).json(device);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// Update
router.put('/:id', requireAuth, async (req, res) => {
  const id = req.params.id;
  try {
    const existing = await db.get('SELECT * FROM devices WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    const { device_model, serial_number, owner_name, date_enrolled, next_maintenance, location, category, color_tag, workbook, notes } = req.body;
    await db.run(
      `UPDATE devices SET device_model = ?, serial_number = ?, owner_name = ?, date_enrolled = ?, next_maintenance = ?, location = ?, category = ?, color_tag = ?, workbook = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [device_model, serial_number, owner_name, date_enrolled, next_maintenance, location, category, color_tag, workbook, notes, id]
    );
    await db.run('INSERT INTO audit_logs (device_id, action, performed_by, details) VALUES (?, ?, ?, ?)', [id, 'updated', req.user.username, JSON.stringify(req.body)]);
    const device = await db.get('SELECT * FROM devices WHERE id = ?', [id]);
    res.json(device);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// Delete
router.delete('/:id', requireAuth, async (req, res) => {
  const id = req.params.id;
  try {
    const existing = await db.get('SELECT * FROM devices WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    await db.run('DELETE FROM devices WHERE id = ?', [id]);
    await db.run('INSERT INTO audit_logs (device_id, action, performed_by, details) VALUES (?, ?, ?, ?)', [id, 'deleted', req.user.username, JSON.stringify(existing)]);
    res.json({ message: 'deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

// CSV import
router.post('/import', requireAuth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'CSV file required' });
  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      let inserted = 0;
      const errors = [];
      for (const row of results) {
        try {
          const stmt = await db.run(`INSERT INTO devices (device_model, serial_number, owner_name, date_enrolled, next_maintenance, location, category, color_tag, workbook, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [row.device_model || row.model || '', row.serial_number || row.serial || '', row.owner_name || row.owner || '', row.date_enrolled || row.enrolled || '', row.next_maintenance || row.maintenance || '', row.location || '', row.category || '', row.color_tag || '', row.workbook || '', row.notes || '']);
          const id = stmt.lastInsertRowid;
          await db.run('INSERT INTO audit_logs (device_id, action, performed_by, details) VALUES (?, ?, ?, ?)', [id, 'imported', req.user.username, JSON.stringify(row)]);
          inserted++;
        } catch (err) {
          errors.push({ row, error: err.message });
        }
      }
      try { fs.unlinkSync(req.file.path); } catch(e){}
      res.json({ inserted, errors });
    });
});

// CSV export
router.get('/export', requireAuth, async (req, res) => {
  try {
    const devices = await db.all('SELECT * FROM devices ORDER BY updated_at DESC', []);
    const csvWriter = createCsvWriter({
      path: '/tmp/devices_export.csv',
      header: [
        {id: 'id', title: 'id'},
        {id: 'device_model', title: 'device_model'},
        {id: 'serial_number', title: 'serial_number'},
        {id: 'owner_name', title: 'owner_name'},
        {id: 'date_enrolled', title: 'date_enrolled'},
        {id: 'next_maintenance', title: 'next_maintenance'},
        {id: 'location', title: 'location'},
        {id: 'category', title: 'category'},
        {id: 'color_tag', title: 'color_tag'},
        {id: 'workbook', title: 'workbook'},
        {id: 'notes', title: 'notes'},
        {id: 'created_at', title: 'created_at'},
        {id: 'updated_at', title: 'updated_at'},
      ]
    });
    await csvWriter.writeRecords(devices);
    res.download('/tmp/devices_export.csv', 'devices_export.csv', (err) => {
      if (err) console.error(err);
      try { fs.unlinkSync('/tmp/devices_export.csv'); } catch(e){}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

module.exports = router;
