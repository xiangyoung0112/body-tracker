const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const os = require('os');
const multer = require('multer');
const qrcode = require('qrcode-terminal');
const { recordDao, settingsDao, uploadsDir } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON body parser
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure Multer for photo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'photo-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
  fileFilter: function (req, file, cb) {
    // Accept image types
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允許上傳圖片檔案 (JPG, PNG, WebP)'));
    }
  }
});

// Serve uploaded photos statically
app.use('/uploads', express.static(uploadsDir));

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'public')));

// Helper to get local LAN IP addresses
function getNetworkIps() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // IPv4 and non-internal
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push({ name, address: iface.address });
      }
    }
  }
  return ips;
}

// ==================== API ROUTES ====================

// 1. Get records (all or only with photos)
app.get('/api/records', (req, res) => {
  try {
    const onlyPhotos = req.query.with_photos === 'true';
    const limit = parseInt(req.query.limit) || 200;
    const offset = parseInt(req.query.offset) || 0;

    let records;
    if (onlyPhotos) {
      records = recordDao.getRecordsWithPhotos();
    } else {
      records = recordDao.getAll(limit, offset);
    }

    res.json({ success: true, data: records });
  } catch (err) {
    console.error('Error fetching records:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Get single record
app.get('/api/records/:id', (req, res) => {
  try {
    const record = recordDao.getById(req.params.id);
    if (!record) {
      return res.status(400).json({ success: false, error: '找不到該筆紀錄' });
    }
    res.json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Create new record with optional photo
app.post('/api/records', upload.single('photo'), (req, res) => {
  try {
    const { weight, body_fat, waist_cm, hip_cm, chest_cm, record_date, note, tags, photo_angle } = req.body;

    const hasWeight = weight !== null && weight !== undefined && weight !== '' && !isNaN(parseFloat(weight));
    const photoPath = req.file ? req.file.filename : null;

    if (!hasWeight && !photoPath) {
      return res.status(400).json({ success: false, error: '請至少輸入體重數值或上傳照片' });
    }

    if (photoPath) {
      const dayPhotos = recordDao.getPhotosByDay(record_date || new Date().toISOString());
      const angle = photo_angle || 'front';
      const existingSameAngle = dayPhotos.find(record => (record.photo_angle || 'front') === angle);

      if (existingSameAngle) {
        const weightVal = (weight !== null && weight !== undefined && weight !== '' && !isNaN(Number(weight)))
          ? parseFloat(weight)
          : existingSameAngle.weight;

        const updated = recordDao.update(existingSameAngle.id, {
          photo_path: photoPath,
          photo_angle: angle,
          weight: weightVal,
          body_fat: body_fat !== undefined ? (body_fat ? parseFloat(body_fat) : null) : undefined,
          waist_cm: waist_cm !== undefined ? (waist_cm ? parseFloat(waist_cm) : null) : undefined,
          hip_cm: hip_cm !== undefined ? (hip_cm ? parseFloat(hip_cm) : null) : undefined,
          chest_cm: chest_cm !== undefined ? (chest_cm ? parseFloat(chest_cm) : null) : undefined,
          note: note !== undefined ? note : undefined,
          tags: tags !== undefined ? tags : undefined
        });

        console.log(`[替換紀錄] ID: ${updated.id}, 角度: ${angle}, 相片: ${photoPath}`);
        return res.json({ success: true, data: updated });
      }

      if (dayPhotos.length >= 3) {
        try { fs.unlinkSync(path.join(uploadsDir, photoPath)); } catch (cleanupError) {}
        return res.status(409).json({
          success: false,
          error: '每天的體態相簿最多 3 張照片 (正面、側面、背面)'
        });
      }
    }

    const weightVal = (weight !== null && weight !== undefined && weight !== '' && !isNaN(Number(weight)))
      ? parseFloat(weight)
      : null;

    const newRecord = recordDao.create({
      weight: weightVal,
      body_fat: body_fat ? parseFloat(body_fat) : null,
      waist_cm: waist_cm ? parseFloat(waist_cm) : null,
      hip_cm: hip_cm ? parseFloat(hip_cm) : null,
      chest_cm: chest_cm ? parseFloat(chest_cm) : null,
      record_date: record_date || new Date().toISOString().substring(0, 10),
      note: note || '',
      tags: tags || '',
      photo_path: photoPath,
      photo_angle: photo_angle || 'front'
    });

    console.log(`[新增紀錄] 體重: ${weightVal !== null ? weightVal + ' kg' : '無紀錄'}, 相片: ${photoPath || '無'}, 日期: ${newRecord.record_date}`);
    res.json({ success: true, data: newRecord });
  } catch (err) {
    console.error('Error creating record:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Delete a record
app.delete('/api/records/:id', (req, res) => {
  try {
    const deleted = recordDao.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: '記錄不存在或已被刪除' });
    }
    console.log(`[刪除紀錄] ID: ${req.params.id}`);
    res.json({ success: true, data: deleted });
  } catch (err) {
    console.error('Error deleting record:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4.1 Update a single record
app.patch('/api/records/:id', (req, res) => {
  try {
    const updated = recordDao.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: '記錄不存在或已被刪除' });
    }
    console.log(`[更新紀錄] ID: ${req.params.id}`);
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Error updating record:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4.2 Update weight for all records on a specific date (or create day record)
app.patch('/api/records/by-date/:date', (req, res) => {
  try {
    const { weight } = req.body;
    const records = recordDao.updateWeightByDate(req.params.date, weight);
    console.log(`[更新日期體重] 日期: ${req.params.date}, 體重: ${weight}`);
    res.json({ success: true, data: records });
  } catch (err) {
    console.error('Error updating weight by date:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Get statistics
app.get('/api/stats', (req, res) => {
  try {
    const stats = recordDao.getStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Get settings
app.get('/api/settings', (req, res) => {
  try {
    const settings = settingsDao.getAll();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Update settings
app.post('/api/settings', (req, res) => {
  try {
    const { target_weight, height_cm, user_name } = req.body;
    if (target_weight !== undefined) settingsDao.set('target_weight', target_weight);
    if (height_cm !== undefined) settingsDao.set('height_cm', height_cm);
    if (user_name !== undefined) settingsDao.set('user_name', user_name);

    res.json({ success: true, data: settingsDao.getAll() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Get Network info (for mobile QR Code display in web UI)
app.get('/api/network-info', (req, res) => {
  const ips = getNetworkIps();
  const wifiIp = ips.find(i => i.address.startsWith('192.168.')) || ips.find(i => i.name.toLowerCase().includes('wi-fi')) || ips[0];
  res.json({
    success: true,
    port: PORT,
    ips: ips,
    primaryUrl: wifiIp ? `http://${wifiIp.address}:${PORT}` : `http://localhost:${PORT}`
  });
});

// Start listening on all network interfaces (0.0.0.0)
app.listen(PORT, '0.0.0.0', () => {
  const networkIps = getNetworkIps();
  const primaryIp = networkIps.find(i => i.address.startsWith('192.168.')) || networkIps[0];
  const mobileUrl = primaryIp ? `http://${primaryIp.address}:${PORT}` : `http://localhost:${PORT}`;

  console.log('\n=============================================================');
  console.log('  🏋️  體態與體重記錄全端伺服器 (iOS 專屬無痕相機優化)');
  console.log('=============================================================');
  console.log(`  💻 本機網址:   http://localhost:${PORT}`);
  if (primaryIp) {
    console.log(`  📱 手機連線網址: \x1b[36m${mobileUrl}\x1b[0m`);
    console.log('-------------------------------------------------------------');
    console.log('  📱 請使用 iPhone 相機掃描下方 QR Code 即可直接開啟網頁：');
    console.log('-------------------------------------------------------------');
    qrcode.generate(mobileUrl, { small: true });
  }
  console.log('=============================================================\n');
});
