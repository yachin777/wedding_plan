# wedding_plan 婚禮籌備網頁

網址：https://yachin777.github.io/wedding_plan/

## 檔案結構

```
wedding_plan/
├─ index.html            頁面骨架（只有 HTML，樣式和功能都在下面的資料夾）
├─ firebase-config.js    Firebase 設定值（雲端同步用，不要刪）
├─ upload.bat            雙擊：同步另一台電腦的修改＋上傳到 GitHub
├─ css/                  樣式（顏色、排版）
│  ├─ base.css           顏色主題（淺色／深色）、字型
│  ├─ layout.css         頁首、底部分頁列、卡片、統計框、按鈕等共用元件
│  ├─ views.css          各分頁專屬樣式：總覽、任務、月曆、廠商、文章、預算
│  └─ form.css           新增／編輯表單、照片、放大檢視、提示訊息
└─ js/                   功能
   ├─ constants.js       固定設定：階段、下拉選單選項、底部分頁
   ├─ utils.js           小工具：日期、金額格式
   ├─ state.js           畫面狀態（目前在哪個分頁、篩選條件）
   ├─ store.js           資料存取（Firebase 雲端／瀏覽器）
   ├─ auth.js            Google 登入／登出
   ├─ components.js      共用元件：任務卡片、期限標籤、統計
   ├─ views/             六個分頁，一個分頁一個檔案
   │  ├─ overview.js     總覽
   │  ├─ calendar.js     月曆
   │  ├─ tasks.js        任務
   │  ├─ vendors.js      廠商
   │  ├─ articles.js     文章（含禮俗指南內容）
   │  ├─ gantt.js        甘特圖
   │  └─ budget.js       預算
   ├─ render.js          重畫畫面
   ├─ form.js            新增／編輯表單
   ├─ photos.js          照片壓縮、放大檢視
   ├─ events.js          按鈕與點擊事件
   └─ main.js            程式進入點（最後載入）
```

## 想改什麼，去哪裡改

| 想改的東西 | 檔案 |
|---|---|
| 整體配色 | `css/base.css` 最上面的顏色變數 |
| 左上角印章字、標題 | `index.html` 的 `<header>` |
| 急迫性、優先等級、廠商狀態、文章分類的選項 | `js/constants.js` |
| 類別、負責人的預設選單 | `js/constants.js` 的 `DEFAULT_OPTS` |
| 底部分頁的名稱或順序 | `js/constants.js` 的 `VIEWS` |
| 表單欄位（新增、刪除、改名稱） | `js/form.js` 最上面的 `FIELDS` |
| 任務卡片上顯示的內容 | `js/components.js` 的 `card()` |
| 某個分頁的畫面 | `js/views/` 裡對應的檔案 |
| 禮俗指南的文字 | `js/views/articles.js` 的 `GUIDE` |
| 每筆資料最多幾張照片 | `js/constants.js` 的 `MAX_PHOTOS` |
| 甘特圖長條顏色 | `js/views/gantt.js` 的 `GANTT_COLORS`、`css/base.css` 的 `--g-mid` |
| 側邊欄寬度 | `css/base.css` 的 `--side` |
| 左上角印章字 | `index.html` 有兩處（手機頁首、電腦側邊欄）都要改 |

## 注意

- `index.html` 裡 `<script>` 的順序不能亂調，`main.js` 一定要在最後。
- 新增 JS 檔案時，要在 `index.html` 加一行 `<script src="...">`，放在 `main.js` 前面。
- 上傳後網站最多要等約 10 分鐘才會更新，可以按 `Ctrl + F5` 強制重新整理。
- 兩台電腦輪流修改時，開始改之前先雙擊一次 `upload.bat` 同步。
