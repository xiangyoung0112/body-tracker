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

## 🌐 線上正式網址（24 小時免開電腦）

👉 **[https://xiangyoung0112.github.io/body-tracker/](https://xiangyoung0112.github.io/body-tracker/)**

無論電腦有沒有開機，直接用 iPhone Safari 打開上方網址即可隨時記錄！

---

## ☁️ Supabase 3 步驟快速綁定（免開電腦）

本系統使用 Supabase 免費提供之資料庫與雲端相片桶：
1. 前往 [Supabase 官網](https://supabase.com) 免費註冊並點擊「New Project」建立專案。
2. 進入專案後，點選左側選單的 **SQL Editor**，開啟專案目錄下的 `supabase_setup.sql` 複製全部內容貼上，點擊「**Run**」執行。
3. 進入左下角 **Project Settings > API**，複製：
   - **Project URL**（專案網址）
   - **anon public key**（公開金鑰）
4. 在手機打開網頁，貼上上述兩項資訊，點擊「確認連線」，即永久綁定完成！

---

## 📲 如何在 iPhone 上設定為全螢幕 App (PWA)

1. 用 iPhone Safari 開啟：`https://xiangyoung0112.github.io/body-tracker/`
2. 點擊 Safari 底部工具列中間的「**分享**」圖示（方框向上箭頭）。
3. 向下滑動找到並點擊「**加入主畫面**」。
4. 點擊右上角「新增」，手機桌面即會產生「體態記錄」App 圖示，點開即可全螢幕無網址列操作！

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
