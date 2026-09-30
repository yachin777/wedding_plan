// ==========================================================
// js/components.js
// 共用畫面元件：統計計算、任務卡片、期限標籤、照片縮圖等，多個分頁都會用到。
// ==========================================================

// 計算一組任務的統計：總數、完成數、逾期數、預估成本、實際支出、完成率、下一個期限
function stats(list){
  const total=list.length,done=list.filter(t=>t.done).length,overdue=list.filter(isOverdue).length;
  const cost=list.reduce((s,t)=>s+(+t.cost||0),0),actual=list.reduce((s,t)=>s+(+t.actual||0),0);
  const next=list.filter(t=>!t.done&&t.due&&t.due>=todayStr()).sort((a,b)=>a.due.localeCompare(b.due))[0];
  return{total,done,overdue,cost,actual,pct:total?Math.round(done/total*100):0,next};
}

// 任務右上角的期限標籤：已完成／逾期 N 天／今天到期／剩 N 天（7 天內變橘色）
function dueBadge(t){
  if(t.done)return `<span class="due ok">已完成</span>`;
  if(!t.due)return '';
  const d=dayDiff(t.due,todayStr());
  if(d<0)return `<span class="due late num">逾期 ${-d} 天</span>`;
  if(d===0)return `<span class="due late">今天到期</span>`;
  return `<span class="due ${d<=7?'soon':''} num">剩 ${d} 天</span>`;
}
// 卡片上的照片縮圖（點了會放大）
function thumbsHtml(item,kind){
  if(!item.photos?.length)return '';
  return `<span class="thumbs">${item.photos.map((p,i)=>`<img src="${esc(p.thumb)}" alt="照片 ${i+1}" data-photo="${kind}:${esc(item.id)}:${i}" loading="lazy">`).join('')}</span>`;
}
// 任務卡片（任務頁、月曆頁共用）。label 是卡片標題前的小標籤，例如「活動」「期限」
function card(t,label){
  const u=URGENCY.indexOf(t.urgency);
  const time=t.start?`${t.start}${t.end?'–'+t.end:''}`:'';
  const facts=[
    t.date?`<span>活動 ${fmtDate(t.date)}${time?' '+time:''}</span>`:(time?`<span>${time}</span>`:''),
    t.due?`<span>期限 ${fmtDate(t.due)}</span>`:'',
    t.owner?`<span>負責：${esc(t.owner)}</span>`:'',
    t.cost?`<span>預估 ${money(t.cost)}</span>`:'',
    t.actual?`<span>實付 ${money(t.actual)}</span>`:''
  ].join('');
  return `<article class="task ${t.done?'done':''} ${isOverdue(t)?'overdue':''}">
    <button class="check" type="button" data-toggle="${esc(t.id)}" aria-label="${t.done?'標為未完成':'標為完成'}">
      <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>
    </button>
    <button class="t-body" type="button" data-edit="tasks:${esc(t.id)}">
      <span class="t-row"><span class="t-title">${label||''}${esc(t.item)}</span>${dueBadge(t)}</span>
      <span class="tags">
        <span class="tag">${stageName(t.stage)}</span>
        ${t.category?`<span class="tag cat">${esc(t.category)}</span>`:''}
        ${t.urgency?`<span class="tag ${u===0?'u0':u===1?'u1':''}">${esc(t.urgency)}</span>`:''}
        ${t.priority?`<span class="tag ${t.priority==='高'?'p0':''}">優先 ${esc(t.priority)}</span>`:''}
      </span>
      ${facts?`<span class="facts num">${facts}</span>`:''}
      ${t.note?`<span class="note">${esc(t.note)}</span>`:''}
      ${thumbsHtml(t,'tasks')}
    </button>
  </article>`;
}
// 總覽頁「逾期」「未來 14 天」列表中的一行
function rowItem(t,when){
  return `<button class="row" type="button" data-edit="tasks:${esc(t.id)}">
    <span class="d num">${fmtShort(when)}</span>
    <span class="t"><b>${esc(t.item)}</b><small>${stageName(t.stage)}${t.owner?' · '+esc(t.owner):''}</small></span>
    ${dueBadge(t)}</button>`;
}

// 各分頁的畫面函式都放在 R 裡：R.overview、R.calendar…，回傳該分頁的 HTML
const R={};
