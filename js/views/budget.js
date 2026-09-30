// ==========================================================
// js/views/budget.js
// 「預算」分頁：總預算、預估與實際支出、各階段／各類別長條圖。
// ==========================================================

// 預算畫面
R.budget=()=>{
  const b=+state.settings.budget||0,T=state.tasks,all=stats(T);
  const remain=b-all.actual,cap=Math.max(b,all.cost,all.actual,1);
  const pctW=v=>(v/cap*100).toFixed(1)+'%';
  const over=b&&all.cost>b;
  const meter=`<div class="meter" role="img" aria-label="實際 ${money(all.actual)}，預估 ${money(all.cost)}，總預算 ${money(b)}">
      <i class="e" style="width:${pctW(all.cost)}" title="預估 ${money(all.cost)}"></i><i class="a" style="width:${pctW(all.actual)}" title="實際 ${money(all.actual)}"></i>
      ${b?`<span class="cap" style="left:calc(${pctW(b)} - 1px)" title="總預算 ${money(b)}"></span>`:''}</div>
    <div class="mlab num"><span>實際 ${money(all.actual)}</span><span>預估 ${money(all.cost)}</span><span>${b?'總預算 '+money(b):'未設定預算'}</span></div>
    ${over?`<div class="warnline">預估花費超出預算 ${money(all.cost-b)}</div>`:''}`;
  const groupRows=groups=>{
    const mx=Math.max(1,...groups.map(g=>Math.max(g.e,g.a)));
    return groups.map(g=>`<div class="brow"><span class="l" title="${esc(g.l)}">${esc(g.l)}</span><div>
      <div class="bars"><span class="b e" style="width:${(g.e/mx*100).toFixed(1)}%" title="${esc(g.l)} 預估 ${money(g.e)}"></span><span class="b a" style="width:${(g.a/mx*100).toFixed(1)}%" title="${esc(g.l)} 實際 ${money(g.a)}"></span></div>
      <div class="v num">預估 ${money(g.e)} · 實際 ${money(g.a)}</div></div></div>`).join('');
  };
  const byStage=STAGES.map(s=>{const x=T.filter(t=>t.stage===s.id);return{l:s.name,e:x.reduce((a,t)=>a+(+t.cost||0),0),a:x.reduce((a,t)=>a+(+t.actual||0),0)}});
  const cm={};for(const t of T){const k=t.category||'未分類';cm[k]=cm[k]||{l:k,e:0,a:0};cm[k].e+=+t.cost||0;cm[k].a+=+t.actual||0}
  const byCat=Object.values(cm).filter(g=>g.e||g.a).sort((x,y)=>y.e-x.e);
  const key=`<div class="key"><span><i style="background:var(--est)"></i>預估</span><span><i style="background:var(--red)"></i>實際</span></div>`;
  const V=state.vendors,signed=V.filter(v=>v.status==='已簽約');
  return `<div class="view-h"><h2>預算</h2><span>依任務的預估成本與實際支出計算</span></div>
    <section class="kpis num">
      <button class="kpi" type="button" data-action="settings"><span>總預算 ✎</span><b>${b?money(b):'點此設定'}</b></button>
      <div class="kpi ${over?'alert':''}"><span>預估花費</span><b>${money(all.cost)}</b></div>
      <div class="kpi"><span>實際支出</span><b>${money(all.actual)}</b></div>
      <div class="kpi ${b&&remain<0?'alert':b?'good':''}"><span>預算剩餘</span><b>${b?money(remain):'—'}</b></div>
    </section>
    <div class="card" style="margin-top:12px">${key}${meter}</div>
    <div class="b-cols"><div>
    <div class="sec-h">各階段</div>
    <div class="card">${key}<div class="brows">${groupRows(byStage)}</div></div>
    </div><div>
    <div class="sec-h">各類別</div>
    <div class="card">${byCat.length?key+`<div class="brows">${groupRows(byCat)}</div>`:`<div class="empty" style="border:0;padding:12px">任務填上預估成本後，這裡會依類別統計</div>`}</div>
    </div></div>
    <div class="sec-h">廠商<button class="link" type="button" data-nav="vendors">看廠商</button></div>
    <section class="kpis num" style="margin-top:0;grid-template-columns:repeat(2,minmax(0,1fr))">
      <div class="kpi"><span>已簽約總額</span><b>${money(signed.reduce((s,v)=>s+(+v.quote||0),0))}</b></div>
      <div class="kpi"><span>已付訂金</span><b>${money(V.reduce((s,v)=>s+(+v.deposit||0),0))}</b></div>
    </section>
    <p class="hint">實際支出請在各任務的「實際支出」欄位填寫。</p>`;
};
