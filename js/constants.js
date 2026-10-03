// ==========================================================
// js/constants.js
// 固定設定：階段、下拉選單選項、底部分頁列。
// 想增減「急迫性」「優先等級」等選項、改分頁名稱，改這個檔案。
// ==========================================================

// 三個階段：id 是存在資料庫的代碼（不要改），name 是畫面上顯示的名稱
// dateKey = 這個階段的日子存在婚禮設定的哪個欄位；mark = 月曆上標在日期格的字
const STAGES=[
  {id:'proposal',    name:'提親',step:'STEP 1',dateKey:'proposalDate',    mark:'提'},
  {id:'registration',name:'登記',step:'STEP 2',dateKey:'registrationDate',mark:'登'},
  {id:'engagement',  name:'訂婚',step:'STEP 3',dateKey:'engagementDate',  mark:'訂'},
  {id:'wedding',     name:'婚禮',step:'STEP 4',dateKey:'weddingDate',     mark:'囍'}
];
// 「急迫性」下拉選單的選項
const URGENCY=['非常緊急','緊急','一般','不急'];
// 「優先等級」下拉選單的選項
const PRIORITY=['高','中','低'];
// 廠商狀態選項（統計會用到「已簽約」「詢價中」，改名時要一起改 js/views/vendors.js）
const VENDOR_STATUS=['列入參考','詢價中','已簽約','不考慮'];
// 收藏文章的分類選項
const ARTICLE_CATS=['禮俗','喜餅禮品','婚紗攝影','婚宴場地','新秘造型','預算省錢','其他'];
// 類別、負責人的預設選單（在表單裡用「＋新增」加的項目會另外存到資料庫）
const DEFAULT_OPTS={
  categories:['禮俗儀式','場地餐飲','服裝造型','攝影錄影','喜餅禮品','金飾婚戒','賓客喜帖','交通住宿','佈置婚顧','其他'],
  people:['新郎','新娘','新人一起','男方家長','女方家長','媒人','婚顧']
};
// 婚禮設定的預設值：婚禮日期、總預算、新郎、新娘
const DEFAULT_SETTINGS={proposalDate:'',registrationDate:'',engagementDate:'',weddingDate:'',budget:0,groom:'',bride:''};
// 下拉選單中「＋新增…」選項的內部代碼
const NEW='__new__';
// 每筆資料最多可放幾張照片
const MAX_PHOTOS=4;
// 產生分頁列圖示用的 SVG 外框
const I=p=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
// 底部分頁列：順序、名稱、圖示。id 要對應 js/views/ 裡的 R.xxx 畫面
const VIEWS=[
  {id:'overview',name:'總覽',icon:I('<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>')},
  {id:'calendar',name:'月曆',icon:I('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>')},
  {id:'tasks',name:'任務',icon:I('<path d="M10 6h10M10 12h10M10 18h10"/><path d="M3.5 6l1.5 1.5L7.5 5M3.5 12l1.5 1.5L7.5 11M3.5 18l1.5 1.5L7.5 17"/>')},
  {id:'vendors',name:'廠商',icon:I('<path d="M4 9l1.2-5h13.6L20 9M4 9v11h16V9M4 9h16M9.5 20v-6h5v6"/>')},
  {id:'articles',name:'文章',icon:I('<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z"/><path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19M9 7.5h6M9 11h6"/>')},
  {id:'gantt',name:'甘特圖',icon:I('<path d="M4 4v16h16"/><path d="M7 7h6M9 11h8M8 15h5"/>')},
  {id:'budget',name:'預算',icon:I('<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10.5h18M15.5 15h2.5M7 3.5h10"/>')}
];
