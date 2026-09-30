// ==========================================================
// js/views/tasks.js
// 「任務」分頁：三階段卡片、統計、篩選、任務清單。
// ==========================================================

// 任務畫面
R.tasks=()=>{
  const stageCards=STAGES.map(s=>{
    const st=stats(state.tasks.filter(t=>t.stage===s.id));
    return `<button class="stage num" type="button" role="tab" data-stage="${s.id}" aria-selected="${s.id===state.stage}">
      <span class="step">${s.step}</span><span class="name">${s.name}</span>
      <span class="pct">${st.pct}<small>%</small></span>
      <span class="bar"><i style="width:${st.pct}%"></i></span>
      <span class="meta"><span>完成 ${st.done}/${st.total}</span><span class="od ${st.overdue?'':'zero'}">逾期 ${st.overdue}</span></span>
    </button>`}).join('');
  const cur=state.tasks.filter(t=>t.stage===state.stage),st=stats(cur);
  const samples=state.tasks.filter(t=>t.sample).length;
  const cats=[...new Set(cur.map(t=>t.category).filter(Boolean))];
  if(state.cat&&!cats.includes(state.cat))state.cat='';
  let list=cur.filter(t=>!state.cat||t.category===state.cat);
  if(state.filter==='open')list=list.filter(t=>!t.done);
  if(state.filter==='overdue')list=list.filter(isOverdue);
  if(state.filter==='done')list=list.filter(t=>t.done);
  const key=t=>t.due||t.date||'9999',pr=t=>PRIORITY.indexOf(t.priority);
  list.sort((a,b)=>(a.done-b.done)||key(a).localeCompare(key(b))||(pr(a)-pr(b)));
  let html='',shownDone=false;
  for(const t of list){
    if(t.done&&!shownDone&&state.filter==='all'&&list.some(x=>!x.done)){html+='<div class="group-h">已完成</div>';shownDone=true}
    html+=card(t);
  }
  const chip=(f,l)=>`<button class="chip" type="button" data-f="${f}" aria-pressed="${state.filter===f}">${l}</button>`;
  return `<div class="view-h"><h2>任務</h2></div>
    <div class="stages" role="tablist">${stageCards}</div>
    <section class="kpis num">
      <div class="kpi"><span>完成 / 總數</span><b>${st.done} / ${st.total}</b></div>
      <div class="kpi ${st.overdue?'alert':''}"><span>逾期</span><b>${st.overdue} 項</b></div>
      <div class="kpi"><span>預估成本</span><b>${money(st.cost)}</b></div>
      <div class="kpi"><span>下一個期限</span><b>${st.next?fmtDate(st.next.due):'—'}</b></div>
    </section>
    ${samples?`<div class="banner"><span>目前有 ${samples} 筆範例資料，可以直接修改，或一次清除。</span><button type="button" id="clearSamples">清除範例</button></div>`:''}
    <div class="chips">${chip('all','全部')}${chip('open','待辦')}${chip('overdue','逾期')}${chip('done','已完成')}
      <select id="catFilter" aria-label="依類別篩選"><option value="">所有類別</option>${cats.map(c=>`<option ${c===state.cat?'selected':''}>${esc(c)}</option>`).join('')}</select></div>
    <div class="list grid">${html||`<div class="empty">${cur.length?'這個篩選條件下沒有項目':`「${stageName(state.stage)}」還沒有任何項目<br>點右下角「新增項目」開始`}</div>`}</div>`;
};
