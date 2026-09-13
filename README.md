# 🏋️ 體態與體重記錄全端網站 (FitTrack)

專為 **iOS iPhone (Safari)** 打造的輕量全端體態與體重記錄系統。

---

## 🌟 核心特色

1. **🛡️ iPhone 相片隔離防護（不留手機，只留後端）**：
   - 採用 HTML5 沙盒相機直接調用技術（`capture="environment"`）。
   - 在 iPhone 上點擊拍照後，系統會直接開啟相機鏡頭，**拍下的照片會直接以記憶體二進位資料傳輸至電腦後端，絕不會存入 iPhone 的「照片 (Photos)」相簿中**。
   - 電腦端完整保存於 `data/uploads/` 資料夾內，保護個人隱私。

2. **📱 iOS 原生 App 級體驗 (PWA)**：
   - Apple Health 極簡深色美學，精準適配 iPhone 瀏海屏 / 動態島與底部橫條。
   - 支援「**加入主畫面**」：在 iPhone Safari 點擊分享並選擇「加入主畫面」，即可像原生 App 一樣全螢幕開啟，無網址列打擾。

3. **📊 體重趨勢折線圖**：
   - 整合 Chart.js 動態平滑曲線，可切換 7天 / 30天 / 90天 / 全部時間範圍。
   - 自動計算 BMI、累計增減、目標體重差距。

4. **⚖️ 體態前後對比 (Before & After)**：
   - 任選兩個日期的體態照片進行比對。
   - 提供「**滑動比對 (Slider)**」與「**並排比對 (Side-by-side)**」，直觀檢視肌肉線條與身形縮小幅度。

5. **📶 QR Code 快速連線**：
   - 伺服器啟動時，終端機會直接顯示 ASCII QR Code 與區域網路連線網址。
   - 手機只需打開內建相機對準螢幕，一點即可秒開。

---

## 🚀 啟動方式

### 方法一：Windows 一鍵雙擊啟動
在專案資料夾中，直接對 `啟動體態記錄.bat` 連按兩下即可啟動！

### 方法二：終端機啟動
```bash
npm start
```

啟動後：
- 電腦本機網址：`http://localhost:3000`
- 手機連線網址：`http://<您的電腦區域網路IP>:3000`（伺服器終端會自動顯示您的 IP 與 QR Code）

---

## 📲 如何在 iPhone 上設定為獨立 App

1. 確認 iPhone 與電腦連接到**同一個 Wi-Fi**。
2. 用 iPhone 相機掃描終端機顯示的 QR Code，或在 Safari 輸入連線網址。
3. 在 Safari 底部工具列點擊「**分享**」按鈕（方框帶向上箭頭）。
4. 向下滑動並選擇「**加入主畫面**」。
5. 點擊右上角「新增」，桌面便會出現「體態記錄」App 圖示，隨點即開！

---

## 📁 檔案與資料庫架構

- `server.js`：Express 後端伺服器與 RESTful API
- `db.js`：使用 Node.js 內建 `node:sqlite` 操作 SQLite 資料庫
- `data/`：
  - `weight_tracker.db`：記錄體重、體脂、備註與關聯時間
  - `uploads/`：存放所有實體體態照片
- `public/`：
  - `index.html`：前端介面結構
  - `style.css`：iOS 現代風格樣式表
  - `app.js`：相機調用、無痕上傳、圖表與對比互動邏輯
  - `manifest.json`：PWA 應用程式設定
  - `icons/`：App 圖示
