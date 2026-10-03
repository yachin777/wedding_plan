// ==========================================================
// js/views/overview.js
// 「總覽」分頁：婚禮倒數、各階段進度、逾期、未來 14 天、預算與廠商摘要。
// ==========================================================

// 總覽畫面
R.overview=()=>{
  const s=state.settings,t=todayStr(),all=stats(state.tasks);
  let hero;
  if(s.weddingDate){
    const d=dayDiff(s.weddingDate,t);
    const ring=`<svg class="ring" viewBox="0 0 84 84" role="img" aria-label="整體進度 ${all.pct}%"><circle cx="42" cy="42" r="34" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="8"/><circle cx="42" cy="42" r="34" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-dasharray="${(all.pct/100*213.6).toFixed(1)} 213.6" transform="rotate(-90 42 42)"/><text x="42" y="42" text-anchor="middle" fill="#fff" font-size="17" font-weight="700">${all.pct}%</text><text x="42" y="57" text-anchor="middle" fill="#fff" font-size="10" opacity=".85">完成</text></svg>`;
    hero=`<section class="hero"><div><small>${d>0?'距離婚禮還有':d===0?'就是今天':'婚禮已過'}</small>
      <div class="days num">${d>0?d:d===0?'囍':-d}<em>${d===0?'':'天'}</em></div>
      <div class="date num">${s.weddingDate.slice(0,4)} 年 ${fmtDate(s.weddingDate)}</div></div>${ring}</section>`;
  }else{
    hero=`<section class="hero unset"><div><b style="font-family:var(--serif);font-size:18px">還沒設定婚禮日期</b><div style="font-size:13px;color:var(--ink-2)">設定後這裡會顯示倒數天數</div></div><button class="btn primary" type="button" data-action="settings">設定</button></section>`;
  }
  // 四個階段的重要日子（點一下可以到婚禮設定修改）
  const days=`<div class="m-days">${STAGES.map(st=>{const d=state.settings[st.dateKey];
    const n=d?dayDiff(d,t):null;
    return `<button class="m-day" type="button" data-action="settings" style="--c:${STAGE_COLORS[st.id]}">
      <span class="m-name">${st.name}</span>
      <b class="num">${d?fmtDate(d):'未設定'}</b>
      <span class="num">${d?(n>0?`還有 ${n} 天`:n===0?'就是今天':'已完成'):'點此設定日期'}</span></button>`}).join('')}</div>`;
  const stageRows=STAGES.map(st=>{const x=stats(state.tasks.filter(k=>k.stage===st.id));
    return `<button class="srow" type="button" data-goto-stage="${st.id}"><span class="n">${st.name}</span>
      <span class="bar"><i style="width:${x.pct}%"></i></span>
      <span class="m num">${x.done}/${x.total} · <span class="od ${x.overdue?'':'zero'}">逾期 ${x.overdue}</span></span></button>`}).join('');
  const overdue=state.tasks.filter(isOverdue).sort((a,b)=>a.due.localeCompare(b.due));
  const limit=addDays(t,14),upcoming=[];
  for(const k of state.tasks){ if(k.done)continue;
    const whens=[k.date,k.due].filter(w=>w&&w>=t&&w<=limit).sort();
    if(whens.length)upcoming.push({k,w:whens[0]});}
  upcoming.sort((a,b)=>a.w.localeCompare(b.w));
  const b=+s.budget||0;
  const signed=state.vendors.filter(v=>v.status==='已簽約').length,asking=state.vendors.filter(v=>v.status==='詢價中').length;
  return `<div class="view-h"><h2>總覽</h2></div>${hero}
    ${days}
    <div class="ov-cols"><div>
    <div class="sec-h">各階段進度<button class="link" type="button" data-nav="tasks">看全部任務</button></div>
    <div class="stage-rows">${stageRows}</div>
    <div class="sec-h">預算與廠商</div>
    <div class="mini">
      <button class="kpi" type="button" data-nav="budget"><span>預估花費</span><b class="num">${money(all.cost)}</b><span class="num">${b?'總預算 '+money(b):'尚未設定預算'}</span></button>
      <button class="kpi" type="button" data-nav="vendors"><span>廠商</span><b class="num">已簽約 ${signed}</b><span class="num">詢價中 ${asking}</span></button>
    </div>
    </div><div>
    <div class="sec-h">逾期 <span class="od ${overdue.length?'':'zero'} num">${overdue.length}</span></div>
    ${overdue.length?`<div class="rows">${overdue.slice(0,5).map(k=>rowItem(k,k.due)).join('')}</div>`:`<div class="empty" style="padding:16px">沒有逾期的項目</div>`}
    <div class="sec-h">未來 14 天<button class="link" type="button" data-nav="calendar">看月曆</button></div>
    ${upcoming.length?`<div class="rows">${upcoming.slice(0,6).map(x=>rowItem(x.k,x.w)).join('')}</div>`:`<div class="empty" style="padding:16px">接下來兩週沒有活動或期限</div>`}
    </div></div>`;
};
