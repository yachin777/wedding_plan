// ==========================================================
// js/utils.js
// 小工具函式：日期、金額格式、安全處理文字等，其他檔案都會用到。
// ==========================================================

// 用 id 取得頁面元素
const $=id=>document.getElementById(id);
// 把使用者輸入的文字轉成安全的 HTML（避免輸入 < > 等符號破壞畫面）
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// 數字補零：5 → "05"
const pad=n=>String(n).padStart(2,'0');
// Date 轉成 "2026-09-30" 格式
const ymd=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
// 今天的日期字串
const todayStr=()=>ymd(new Date());
// 日期加減天數
const addDays=(s,n)=>{const d=new Date(s+'T00:00:00');d.setDate(d.getDate()+n);return ymd(d)};
// 兩個日期相差幾天（a 減 b）
const dayDiff=(a,b)=>Math.round((Date.parse(a+'T00:00:00')-Date.parse(b+'T00:00:00'))/864e5);
// 金額格式：12000 → "NT$12,000"
const money=n=>'NT$'+Math.round(n||0).toLocaleString('zh-TW');
// 星期幾
const WD='日一二三四五六';
// 日期顯示：2026-10-11 → "10/11（日）"
const fmtDate=s=>{if(!s)return'';const[,m,d]=s.split('-');return `${+m}/${+d}（${WD[new Date(s+'T00:00:00').getDay()]}）`};
// 日期簡短顯示：2026-10-11 → "10/11"
const fmtShort=s=>{if(!s)return'';const[,m,d]=s.split('-');return `${+m}/${+d}`};
// 是否逾期：還沒完成，而且最後期限在今天之前
const isOverdue=t=>!t.done&&t.due&&t.due<todayStr();
// 階段代碼轉成中文名稱
const stageName=id=>STAGES.find(s=>s.id===id)?.name||'';
// 只接受 http:// 或 https:// 開頭的網址
const safeUrl=u=>/^https?:\/\//i.test(u||'')?u:'';
// 從網址取出網站名稱，例如 www.facebook.com → facebook.com
const host=u=>{try{return new URL(u).hostname.replace(/^www\./,'')}catch{return''}};
