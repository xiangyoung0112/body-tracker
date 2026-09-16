const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

// Ensure data and uploads directories exist
const dataDir = path.join(__dirname, 'data');
const uploadsDir = path.join(dataDir, 'uploads');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'weight_tracker.db');
const db = new DatabaseSync(dbPath);

// Initialize database tables
function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      weight REAL,
      body_fat REAL,
      waist_cm REAL,
      hip_cm REAL,
      chest_cm REAL,
      record_date TEXT NOT NULL,
      note TEXT,
      tags TEXT,
      photo_path TEXT,
      photo_angle TEXT DEFAULT 'front',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  try { db.exec(`ALTER TABLE records ADD COLUMN waist_cm REAL;`); } catch (e) {}
  try { db.exec(`ALTER TABLE records ADD COLUMN hip_cm REAL;`); } catch (e) {}
  try { db.exec(`ALTER TABLE records ADD COLUMN chest_cm REAL;`); } catch (e) {}

  // Check if weight column allows NULL in SQLite
  try {
    const tableInfo = db.prepare(`PRAGMA table_info(records)`).all();
    const weightCol = tableInfo.find(c => c.name === 'weight');
    if (weightCol && weightCol.notnull === 1) {
      db.exec(`
        CREATE TABLE records_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          weight REAL,
          body_fat REAL,
          waist_cm REAL,
          hip_cm REAL,
          chest_cm REAL,
          record_date TEXT NOT NULL,
          note TEXT,
          tags TEXT,
          photo_path TEXT,
          photo_angle TEXT DEFAULT 'front',
          created_at TEXT NOT NULL
        );
        INSERT INTO records_new (id, weight, body_fat, waist_cm, hip_cm, chest_cm, record_date, note, tags, photo_path, photo_angle, created_at)
        SELECT id, weight, body_fat, waist_cm, hip_cm, chest_cm, record_date, note, tags, photo_path, photo_angle, created_at FROM records;
        DROP TABLE records;
        ALTER TABLE records_new RENAME TO records;
      `);
    }
  } catch (migErr) {
    console.warn('SQLite migration warning:', migErr);
  }

  // Initialize default settings if not already present
  const defaultSettings = [
    { key: 'target_weight', value: '65.0' },
    { key: 'height_cm', value: '175.0' },
    { key: 'user_name', value: '體態記錄' }
  ];

  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)
  `);

  for (const s of defaultSettings) {
    insertSetting.run(s.key, s.value);
  }
}

initDb();

const recordDao = {
  // Get all records ordered by record_date descending
  getAll(limit = 100, offset = 0) {
    const stmt = db.prepare(`
      SELECT * FROM records
      ORDER BY record_date DESC, id DESC
      LIMIT ? OFFSET ?
    `);
    return stmt.all(limit, offset);
  },

  // Get records with photos only (for physique timeline / comparison)
  getRecordsWithPhotos() {
    const stmt = db.prepare(`
      SELECT * FROM records
      WHERE photo_path IS NOT NULL AND photo_path != ''
      ORDER BY record_date DESC, id DESC
    `);
    return stmt.all();
  },

  getPhotosByDay(recordDate) {
    const dayKey = String(recordDate || '').substring(0, 10);
    return db.prepare(`
      SELECT * FROM records
      WHERE photo_path IS NOT NULL AND photo_path != ''
        AND substr(record_date, 1, 10) = ?
      ORDER BY id DESC
    `).all(dayKey);
  },

  // Get a single record by ID
  getById(id) {
    const stmt = db.prepare(`SELECT * FROM records WHERE id = ?`);
    return stmt.get(id);
  },

  // Insert a new record
  create({ weight, body_fat, waist_cm, hip_cm, chest_cm, record_date, note, tags, photo_path, photo_angle }) {
    const createdAt = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO records (weight, body_fat, waist_cm, hip_cm, chest_cm, record_date, note, tags, photo_path, photo_angle, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const weightVal = (weight !== null && weight !== undefined && weight !== '' && !isNaN(Number(weight)))
      ? parseFloat(weight)
      : null;
    const result = stmt.run(
      weightVal,
      body_fat ? parseFloat(body_fat) : null,
      waist_cm ? parseFloat(waist_cm) : null,
      hip_cm ? parseFloat(hip_cm) : null,
      chest_cm ? parseFloat(chest_cm) : null,
      record_date || createdAt.substring(0, 10),
      note || '',
      tags || '',
      photo_path || null,
      photo_angle || 'front',
      createdAt
    );
    return this.getById(result.lastInsertRowid);
  },

  // Delete a record by ID and return the deleted record (so we can delete photo file)
  delete(id) {
    const record = this.getById(id);
    if (!record) return null;

    const stmt = db.prepare(`DELETE FROM records WHERE id = ?`);
    stmt.run(id);

    // If there is an associated photo file, delete it
    if (record.photo_path) {
      const fullPath = path.join(uploadsDir, record.photo_path);
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
        } catch (e) {
          console.error(`Failed to delete photo file: ${fullPath}`, e);
        }
      }
    }

    return record;
  },

  // Update a record by ID
  update(id, fields = {}) {
    const existing = this.getById(id);
    if (!existing) return null;

    if (fields.photo_path && existing.photo_path && fields.photo_path !== existing.photo_path) {
      const oldPath = path.join(uploadsDir, existing.photo_path);
      if (fs.existsSync(oldPath)) {
        try { fs.unlinkSync(oldPath); } catch (e) {}
      }
    }

    const weightVal = ('weight' in fields)
      ? (fields.weight !== null && fields.weight !== undefined && fields.weight !== '' && !isNaN(Number(fields.weight)) ? parseFloat(fields.weight) : null)
      : existing.weight;

    const stmt = db.prepare(`
      UPDATE records
      SET weight = ?,
          body_fat = CASE WHEN ? IS NOT NULL THEN ? ELSE body_fat END,
          waist_cm = CASE WHEN ? IS NOT NULL THEN ? ELSE waist_cm END,
          hip_cm = CASE WHEN ? IS NOT NULL THEN ? ELSE hip_cm END,
          chest_cm = CASE WHEN ? IS NOT NULL THEN ? ELSE chest_cm END,
          note = CASE WHEN ? IS NOT NULL THEN ? ELSE note END,
          tags = CASE WHEN ? IS NOT NULL THEN ? ELSE tags END,
          record_date = CASE WHEN ? IS NOT NULL THEN ? ELSE record_date END,
          photo_path = CASE WHEN ? IS NOT NULL THEN ? ELSE photo_path END,
          photo_angle = CASE WHEN ? IS NOT NULL THEN ? ELSE photo_angle END
      WHERE id = ?
    `);

    const bf = (fields.body_fat !== undefined && fields.body_fat !== null && fields.body_fat !== '') ? parseFloat(fields.body_fat) : null;
    const waist = (fields.waist_cm !== undefined && fields.waist_cm !== null && fields.waist_cm !== '') ? parseFloat(fields.waist_cm) : null;
    const hip = (fields.hip_cm !== undefined && fields.hip_cm !== null && fields.hip_cm !== '') ? parseFloat(fields.hip_cm) : null;
    const chest = (fields.chest_cm !== undefined && fields.chest_cm !== null && fields.chest_cm !== '') ? parseFloat(fields.chest_cm) : null;
    const note = (fields.note !== undefined && fields.note !== null) ? String(fields.note) : null;
    const tags = (fields.tags !== undefined && fields.tags !== null) ? String(fields.tags) : null;
    const rDate = (fields.record_date !== undefined && fields.record_date !== null) ? String(fields.record_date) : null;
    const pPath = (fields.photo_path !== undefined && fields.photo_path !== null) ? String(fields.photo_path) : null;
    const pAngle = (fields.photo_angle !== undefined && fields.photo_angle !== null) ? String(fields.photo_angle) : null;

    stmt.run(
      weightVal,
      bf, bf,
      waist, waist,
      hip, hip,
      chest, chest,
      note, note,
      tags, tags,
      rDate, rDate,
      pPath, pPath,
      pAngle, pAngle,
      id
    );

    return this.getById(id);
  },

  // Update or set weight for all records on a given date (e.g. '2026-09-16')
  updateWeightByDate(recordDate, weight) {
    const dayKey = String(recordDate || '').substring(0, 10);
    const weightVal = (weight !== null && weight !== undefined && weight !== '' && !isNaN(Number(weight)))
      ? parseFloat(weight)
      : null;

    const recordsOnDay = db.prepare(`SELECT * FROM records WHERE substr(record_date, 1, 10) = ?`).all(dayKey);
    if (recordsOnDay.length > 0) {
      db.prepare(`
        UPDATE records
        SET weight = ?
        WHERE substr(record_date, 1, 10) = ?
      `).run(weightVal, dayKey);
    } else {
      // If no record on this day, create a new record
      this.create({
        weight: weightVal,
        record_date: `${dayKey} 08:00:00`,
        note: ''
      });
    }

    return db.prepare(`SELECT * FROM records WHERE substr(record_date, 1, 10) = ? ORDER BY id DESC`).all(dayKey);
  },

  // Get statistics for dashboard
  getStats() {
    // Total entries
    const countStmt = db.prepare(`SELECT COUNT(*) as count FROM records`);
    const { count } = countStmt.get();

    // Latest record that has weight
    const latestStmt = db.prepare(`
      SELECT weight, body_fat, record_date FROM records
      WHERE weight IS NOT NULL
      ORDER BY record_date DESC, id DESC
      LIMIT 1
    `);
    const latest = latestStmt.get() || null;

    // First (earliest) record that has weight
    const earliestStmt = db.prepare(`
      SELECT weight, body_fat, record_date FROM records
      WHERE weight IS NOT NULL
      ORDER BY record_date ASC, id ASC
      LIMIT 1
    `);
    const earliest = earliestStmt.get() || null;

    // Min and Max weight
    const minMaxStmt = db.prepare(`
      SELECT MIN(weight) as min_weight, MAX(weight) as max_weight FROM records
      WHERE weight IS NOT NULL
    `);
    const { min_weight, max_weight } = minMaxStmt.get() || { min_weight: null, max_weight: null };

    // Target weight & Height
    const settings = settingsDao.getAll();

    return {
      total_count: count,
      latest: latest,
      earliest: earliest,
      min_weight: min_weight,
      max_weight: max_weight,
      target_weight: parseFloat(settings.target_weight || '65.0'),
      height_cm: parseFloat(settings.height_cm || '175.0'),
      weight_change: (latest && earliest && latest.weight !== null && earliest.weight !== null)
        ? parseFloat((latest.weight - earliest.weight).toFixed(1))
        : 0
    };
  }
};

const settingsDao = {
  getAll() {
    const stmt = db.prepare(`SELECT key, value FROM settings`);
    const rows = stmt.all();
    const result = {};
    for (const r of rows) {
      result[r.key] = r.value;
    }
    return result;
  },

  set(key, value) {
    const stmt = db.prepare(`
      INSERT INTO settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);
    stmt.run(key, String(value));
  }
};

module.exports = {
  db,
  dataDir,
  uploadsDir,
  recordDao,
  settingsDao
};
