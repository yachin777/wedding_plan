// ==========================================================
// js/views/gantt.js
// 「甘特圖」分頁：橫軸是日期、縱軸是任務名稱，每個任務畫成一條從開始日到截止日的長條。
// 可以依階段、日期區間、完成狀態篩選，並依日期／類別／名稱排序。
// ==========================================================

// 任務在甘特圖上的起訖日：
//   開始 = 開始日期 → 沒填就用活動日期 → 再沒有就用最後期限
//   結束 = 最後期限 → 沒填就用活動日期 → 再沒有就用開始日期
// 三個日期都沒填的任務不會畫在圖上。
function ganttSpan(t){
  let s=t.startDate||t.date||t.due||'', e=t.due||t.date||t.startDate||'';
  if(!s||!e)return null;
  if(e<s)[s,e]=[e,s];
  return {s,e};
}

// 三個階段在圖上的顏色（圖例會一起顯示）
const GANTT_COLORS={proposal:'#FFD306',engagement:'#0080FF',wedding:'var(--red)'};
// 長條上日期文字的顏色：淺色長條（例如黃色）用深色字，深色長條用白字，才看得清楚
const GANTT_TEXT={proposal:'#2A1F23',engagement:'#FFFFFF',wedding:'#FFFFFF'};

R.gantt=()=>{
  const g=state.gantt,t0=todayStr();

  // ---------- 1. 篩選 ----------
  let rows=state.tasks.map(t=>({t,sp:ganttSpan(t)}));
  const noDate=rows.filter(r=>!r.sp).length;
  rows=rows.filter(r=>r.sp);
  if(g.stage!=='all')rows=rows.filter(r=>r.t.stage===g.stage);
  if(g.status==='open')rows=rows.filter(r=>!r.t.done);
  if(g.status==='done')rows=rows.filter(r=>r.t.done);
  if(g.from)rows=rows.filter(r=>r.sp.e>=g.from);   // 和日期區間有重疊就顯示
  if(g.to)rows=rows.filter(r=>r.sp.s<=g.to);

  // ---------- 2. 排序 ----------
  const byName=(a,b)=>String(a.t.item||'').localeCompare(String(b.t.item||''),'zh-Hant-TW');
  const byDate=(a,b)=>a.sp.s.localeCompare(b.sp.s)||a.sp.e.localeCompare(b.sp.e)||byName(a,b);
  if(g.sort==='name')rows.sort(byName);
  else if(g.sort==='category')rows.sort((a,b)=>String(a.t.category||'~').localeCompare(String(b.t.category||'~'),'zh-Hant-TW')||byDate(a,b));
  else rows.sort(byDate);

  // ---------- 3. 篩選列 ----------
  const chip=(k,v,l)=>`<button class="chip" type="button" data-g="${k}:${v}" aria-pressed="${g[k]===v}">${l}</button>`;
  const controls=`
    <div class="chips">${chip('stage','all','全部階段')}${STAGES.map(s=>chip('stage',s.id,s.name)).join('')}</div>
    <div class="chips">${chip('status','all','全部')}${chip('status','open','未完成')}${chip('status','done','已完成')}</div>
    <div class="g-tools">
      <label>從 <input type="date" id="gFrom" value="${esc(g.from)}"></label>
      <label>到 <input type="date" id="gTo" value="${esc(g.to)}"></label>
      <label>排序 <select id="gSort">
        <option value="date" ${g.sort==='date'?'selected':''}>依日期</option>
        <option value="category" ${g.sort==='category'?'selected':''}>依類別</option>
        <option value="name" ${g.sort==='name'?'selected':''}>依名稱（A→Z／筆畫）</option>
      </select></label>
      ${(g.from||g.to||g.stage!=='all'||g.status!=='all')?'<button class="btn" type="button" data-g="reset:1">清除篩選</button>':''}
    </div>`;
  const head=`<div class="view-h"><h2>甘特圖</h2><span>${rows.length} 項任務${noDate?`・${noDate} 項沒填日期未顯示`:''}</span></div>`;
  if(!rows.length){
    return head+controls+`<div class="empty" style="margin-top:14px">${state.tasks.length?'沒有符合篩選條件的任務':'還沒有任務'}<br>任務要填「開始日期」或「最後期限」才會出現在甘特圖上</div>`;
  }

  // ---------- 4. 計算日期範圍與每天的寬度 ----------
  let min=g.from||rows.reduce((m,r)=>r.sp.s<m?r.sp.s:m,rows[0].sp.s);
  let max=g.to||rows.reduce((m,r)=>r.sp.e>m?r.sp.e:m,rows[0].sp.e);
  if(!g.from)min=addDays(min,-2);
  if(!g.to)max=addDays(max,2);
  const days=dayDiff(max,min)+1;
  // 天數少時每天寬一點，天數多時窄一點（最少 6px，最多 36px）
  const dw=Math.max(6,Math.min(36,Math.round(840/days)));
  const W=days*dw;
  const x=d=>dayDiff(d,min)*dw;               // 某一天在圖上的水平位置（px）

  // ---------- 5. 日期軸（上排月份、下排日期） ----------
  let months='',ticks='';
  for(let i=0;i<days;i++){
    const d=addDays(min,i),[,mm,dd]=d.split('-').map(Number);
    // 月份標籤：每月 1 號標一次；最左邊如果離下個月太近就不標，避免文字重疊
    const dim=new Date(+d.slice(0,4),mm,0).getDate();
    if(dd===1||(i===0&&(dim-dd+1)*dw>=44)){
      months+=`<span class="g-month" style="left:${i*dw}px">${mm} 月</span>`;
    }
    // 每天寬度夠就每天標，不夠就只標每週一
    const wd=new Date(d+'T00:00:00').getDay();
    if(dw>=22||wd===1){
      ticks+=`<span class="g-tick ${wd===0||wd===6?'we':''}" style="left:${i*dw}px;width:${dw>=22?dw:'auto'}px">${dd}</span>`;
    }
  }
  // 背景格線：天數少畫每天，多的話畫每週
  const gridStep=dw>=12?dw:dw*7;
  // 今天（紅線）與婚禮日（金線）：畫在日期軸與每一列裡
  const todayLine=(t0>=min&&t0<=max)?`<span class="g-today" style="left:${x(t0)+dw/2}px" title="今天"></span>`:'';
  const wd=state.settings.weddingDate;
  const wedLine=(wd&&wd>=min&&wd<=max)?`<span class="g-wed" style="left:${x(wd)+dw/2}px" title="婚禮日 ${fmtDate(wd)}"></span>`:'';
  const lines=todayLine+wedLine;

  // ---------- 6. 每一列任務 ----------
  let lastCat=null;
  const body=rows.map(({t,sp})=>{
    let grp='';
    if(g.sort==='category'&&(t.category||'未分類')!==lastCat){
      lastCat=t.category||'未分類';
      grp=`<div class="g-group">${esc(lastCat)}</div>`;
    }
    // 篩選日期區間時，把超出範圍的部分裁掉
    const s=sp.s<min?min:sp.s,e=sp.e>max?max:sp.e;
    const left=x(s),width=(dayDiff(e,s)+1)*dw;
    const late=isOverdue(t);
    const tip=`${t.item}｜${stageName(t.stage)}${t.category?'・'+t.category:''}｜${fmtDate(sp.s)} → ${fmtDate(sp.e)}（${dayDiff(sp.e,sp.s)+1} 天）${t.done?'｜已完成':late?'｜已逾期':''}`;
    return `${grp}<button type="button" class="g-name" data-edit="tasks:${esc(t.id)}" title="${esc(tip)}">
        <i class="g-dot" style="background:${GANTT_COLORS[t.stage]||'var(--ink-3)'}"></i><span>${esc(t.item)}</span></button>
      <div class="g-track">${lines}
        <button type="button" class="g-bar ${t.done?'done':''} ${late?'late':''}" data-edit="tasks:${esc(t.id)}" title="${esc(tip)}"
          style="left:${left}px;width:${Math.max(width,dw)}px;--c:${GANTT_COLORS[t.stage]||'var(--ink-3)'};--t:${GANTT_TEXT[t.stage]||'#fff'}">${width>=70?`<span>${fmtShort(sp.s)}–${fmtShort(sp.e)}</span>`:''}</button>
      </div>`;
  }).join('');

  const legend=`<div class="legend g-legend">${STAGES.map(s=>`<span><i class="g-key" style="background:${GANTT_COLORS[s.id]}"></i>${s.name}</span>`).join('')}
    <span><i class="g-key done"></i>已完成</span><span><i class="g-key late"></i>逾期（紅框）</span>
    <span><i class="g-key today"></i>今天</span>${wedLine?'<span><i class="g-key wed"></i>婚禮日</span>':''}</div>`;

  return head+controls+legend+`
    <div class="g-scroll">
      <div class="gantt" style="--dw:${dw}px;--gs:${gridStep}px;grid-template-columns:var(--g-name-w) ${W}px">
        <div class="g-corner">任務</div>
        <div class="g-axis">${lines}${months}<div class="g-ticks">${ticks}</div></div>
        ${body}
      </div>
    </div>
    <p class="hint">點任務名稱或長條可以編輯。電腦上把滑鼠移到長條上會顯示日期；左右滑動可以看更多日期。</p>`;
};
