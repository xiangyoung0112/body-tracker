const fs = require('fs');
const path = require('path');
const http = require('http');

async function runTests() {
  console.log('🚀 開始執行全端測試...\n');

  // Start fresh db for testing
  const { db, dataDir, uploadsDir } = require('./db.js');
  db.exec('DELETE FROM records; DELETE FROM settings;');
  db.exec("INSERT INTO settings (key, value) VALUES ('target_weight', '65.0'), ('height_cm', '175.0');");

  // Give server 500ms to bind
  await new Promise(r => setTimeout(r, 500));

  const baseUrl = 'http://127.0.0.1:3001';

  try {
    // Test 1: Check network-info
    console.log('--- 測試 1: 獲取網路連線資訊 ---');
    const netRes = await fetch(`${baseUrl}/api/network-info`).then(r => r.json());
    console.log('網路資訊:', netRes);
    if (!netRes.success || !netRes.primaryUrl.includes('192.168.0.166')) {
      throw new Error('網路資訊未正確優先取得 192.168.0.166');
    }
    console.log('✅ 測試 1 通過\n');

    // Test 2: Create a dummy image file for upload testing
    console.log('--- 測試 2: 建立測試圖片並進行無痕上傳測試 ---');
    const dummyImagePath = path.join(__dirname, 'test_dummy.jpg');
    fs.writeFileSync(dummyImagePath, Buffer.from('FAKE_IMAGE_DATA_FIT_TRACK'));

    const formData1 = new FormData();
    formData1.append('weight', '75.2');
    formData1.append('body_fat', '21.5');
    formData1.append('record_date', '2026-09-01T08:00');
    formData1.append('note', '第一天基準日');
    formData1.append('tags', '空腹晨磅');
    formData1.append('photo_angle', 'front');
    formData1.append('photo', new Blob([fs.readFileSync(dummyImagePath)], { type: 'image/jpeg' }), 'day1.jpg');

    const rec1Res = await fetch(`${baseUrl}/api/records`, { method: 'POST', body: formData1 }).then(r => r.json());
    console.log('記錄 1 回應:', rec1Res);
    if (!rec1Res.success || !rec1Res.data.photo_path) {
      throw new Error('記錄 1 上傳失敗或缺少相片');
    }

    // Verify file exists on disk
    const savedPhoto1 = path.join(__dirname, 'data', 'uploads', rec1Res.data.photo_path);
    if (!fs.existsSync(savedPhoto1)) {
      throw new Error('後端實體相片未在 data/uploads/ 中找到: ' + savedPhoto1);
    }
    console.log('✅ 後端已實體保存相片:', rec1Res.data.photo_path);
    console.log('✅ 測試 2 通過\n');

    // Test 3: Create second record (After)
    console.log('--- 測試 3: 建立第二筆記錄 (含相片) 與第三筆記錄 ---');
    const formData2 = new FormData();
    formData2.append('weight', '72.8');
    formData2.append('body_fat', '19.8');
    formData2.append('record_date', '2026-09-10T08:00');
    formData2.append('note', '第十天線條開始顯現');
    formData2.append('tags', '空腹晨磅,重訓後');
    formData2.append('photo_angle', 'front');
    formData2.append('photo', new Blob([fs.readFileSync(dummyImagePath)], { type: 'image/jpeg' }), 'day10.jpg');

    const rec2Res = await fetch(`${baseUrl}/api/records`, { method: 'POST', body: formData2 }).then(r => r.json());
    console.log('記錄 2 回應:', rec2Res);

    // Record 3 without photo
    const formData3 = new FormData();
    formData3.append('weight', '72.4');
    formData3.append('record_date', '2026-09-13T08:00');
    formData3.append('note', '今天');
    const rec3Res = await fetch(`${baseUrl}/api/records`, { method: 'POST', body: formData3 }).then(r => r.json());
    console.log('記錄 3 回應:', rec3Res);
    console.log('✅ 測試 3 通過\n');

    // Test 4: Stats calculation
    console.log('--- 測試 4: 驗證統計指標 ---');
    const statsRes = await fetch(`${baseUrl}/api/stats`).then(r => r.json());
    console.log('統計資料:', statsRes.data);
    if (statsRes.data.latest.weight !== 72.4 || statsRes.data.earliest.weight !== 75.2) {
      throw new Error('最新或起始體重統計不符合預期');
    }
    if (statsRes.data.weight_change !== -2.8) {
      throw new Error('體重差額計算錯誤');
    }
    console.log('✅ 體重減輕:', statsRes.data.weight_change, 'kg');
    console.log('✅ 測試 4 通過\n');

    // Test 5: Verify records with photos filter (for Before & After)
    console.log('--- 測試 5: 驗證相片專用查詢 (Before & After 對比器) ---');
    const photosRes = await fetch(`${baseUrl}/api/records?with_photos=true`).then(r => r.json());
    console.log('帶相片記錄數量:', photosRes.data.length);
    if (photosRes.data.length !== 2) {
      throw new Error(`預期有 2 筆相片記錄，實際有 ${photosRes.data.length} 筆`);
    }
    console.log('✅ 測試 5 通過\n');

    // Test 6: Verify Settings update
    console.log('--- 測試 6: 驗證身高與目標體重設定 ---');
    const setRes = await fetch(`${baseUrl}/api/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ height_cm: 180, target_weight: 70.0 })
    }).then(r => r.json());
    console.log('更新後設定:', setRes);
    if (parseFloat(setRes.data.height_cm) !== 180 || parseFloat(setRes.data.target_weight) !== 70) {
      throw new Error('設定更新不符合預期');
    }
    console.log('✅ 測試 6 通過\n');

    // Test 7: Static files serving
    console.log('--- 測試 7: 驗證前端靜態頁面傳遞 ---');
    const indexHtml = await fetch(`${baseUrl}/`).then(r => r.text());
    if (!indexHtml.includes('FitTrack') || !indexHtml.includes('capture="environment"')) {
      throw new Error('前端 index.html 未包含無痕相機或關鍵元素');
    }
    const cssContent = await fetch(`${baseUrl}/style.css`).then(r => r.text());
    if (!cssContent.includes('--bg-primary')) {
      throw new Error('style.css 讀取失敗');
    }
    const jsContent = await fetch(`${baseUrl}/app.js`).then(r => r.text());
    if (!jsContent.includes('compressImage')) {
      throw new Error('app.js 讀取失敗');
    }
    console.log('✅ 前端 HTML / CSS / JS 靜態服務正常\n');

    // Clean up dummy test file
    if (fs.existsSync(dummyImagePath)) fs.unlinkSync(dummyImagePath);

    console.log('🎉 所有全端測試驗證全部成功通過！');
    process.exit(0);
  } catch (err) {
    console.error('❌ 測試失敗:', err);
    process.exit(1);
  }
}

runTests();
