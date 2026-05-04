# 設計日報 · Design Brief

每日自動從 Dezeen、It's Nice That 等媒體爬梳設計與時尚資訊，由 Claude AI 整理成結構化日報。

---

## 設定步驟

### 1. 建立 GitHub Repository

1. 前往 [github.com](https://github.com) 登入
2. 點右上角 **+** → **New repository**
3. 命名為 `design-brief`（或任何你喜歡的名稱）
4. 設為 **Public**（GitHub Pages 免費版需要公開）
5. 點 **Create repository**

### 2. 上傳這些檔案

把這個資料夾裡所有檔案上傳到你剛建立的 repository：

```
design-brief/
├── index.html
├── package.json
├── brief.json          ← 先手動建一個空的（見下方）
├── scripts/
│   └── generate-brief.js
└── .github/
    └── workflows/
        └── daily-brief.yml
```

**建立空的 brief.json**，內容為：
```json
{"articles": [], "generated_at": null}
```

### 3. 取得 Anthropic API Key

1. 前往 [console.anthropic.com](https://console.anthropic.com)
2. 登入或註冊帳號
3. 左側選單 → **API Keys** → **Create Key**
4. 複製這個 key（只會顯示一次）

### 4. 把 API Key 存入 GitHub Secrets

1. 在你的 repository 頁面，點 **Settings**
2. 左側選單 → **Secrets and variables** → **Actions**
3. 點 **New repository secret**
4. Name 填：`ANTHROPIC_API_KEY`
5. Secret 貼上你的 API key
6. 點 **Add secret**

### 5. 開啟 GitHub Pages

1. 在 repository 的 **Settings** → **Pages**
2. Source 選 **Deploy from a branch**
3. Branch 選 **main**，資料夾選 **/ (root)**
4. 點 **Save**
5. 等約 1 分鐘，你的網站網址會出現在頁面上

### 6. 手動觸發第一次更新

1. 進入 repository 的 **Actions** 頁籤
2. 左側選 **Daily Design Brief**
3. 點 **Run workflow** → **Run workflow**
4. 等約 30-60 秒完成
5. 重新整理你的網站，今日日報就出現了！

---

## 自動排程

設定完成後，GitHub Actions 會在每天 **早上 9:00（台灣時間）** 自動執行，更新 `brief.json`，網站隨即顯示最新內容。

## 費用

- GitHub Pages：**免費**
- GitHub Actions：**免費**（每月 2000 分鐘，每天執行約用 1 分鐘）
- Anthropic API：按使用量計費，每天約 **NT$1-3**

---

Made with Claude · Dezeen · It's Nice That
