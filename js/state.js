// ==========================================================
// js/state.js
// 畫面狀態：目前的資料與使用者正在看哪個分頁。
// ==========================================================

// 整個網頁的狀態：
//   tasks/vendors/articles = 任務、廠商、文章資料
//   opts = 類別與負責人選單；settings = 婚禮設定
//   view = 目前分頁；stage = 任務頁選的階段；filter/cat/vfilter/aseg = 各頁的篩選
//   calMonth/calDay = 月曆顯示的月份與選取的日期；user = 登入的帳號
const state={tasks:[],vendors:[],articles:[],opts:structuredClone(DEFAULT_OPTS),settings:{...DEFAULT_SETTINGS},
  view:'overview',stage:'proposal',filter:'all',cat:'',vfilter:'all',aseg:'guide',calMonth:'',calDay:'',ready:false,user:null,authError:''};
// 還原上次停留的分頁與階段
try{const v=localStorage.getItem('wp-view');if(VIEWS.some(x=>x.id===v))state.view=v;
  const s=localStorage.getItem('wp-stage');if(STAGES.some(x=>x.id===s))state.stage=s}catch{}
// 網址後面加 #calendar、#budget 等，可以直接打開指定分頁
const hv=location.hash.slice(1);
if(VIEWS.some(x=>x.id===hv))state.view=hv;
// 月曆預設顯示本月、選取今天
state.calMonth=todayStr().slice(0,7);state.calDay=todayStr();
// 記住目前分頁與階段（下次打開回到同一頁）
function remember(){try{localStorage.setItem('wp-view',state.view);localStorage.setItem('wp-stage',state.stage)}catch{}}
