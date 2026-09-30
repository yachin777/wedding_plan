// ==========================================================
// js/render.js
// 畫面更新：資料或分頁一變動就呼叫 render() 重畫。
// ==========================================================

// 右下角「新增」按鈕在各分頁顯示的文字，以及要新增哪一種資料（null = 不顯示按鈕）
const FAB={overview:['新增項目','tasks'],calendar:['新增項目','tasks'],tasks:['新增項目','tasks'],vendors:['新增廠商','vendors'],articles:['收藏文章','articles'],budget:null};
// 重畫整個畫面：頁首、分頁列、目前分頁內容、右下角按鈕。
// 沒登入時顯示登入畫面。
function render(){
  const s=state.settings,parts=[];
  if(s.groom||s.bride)parts.push(`${esc(s.groom||'新郎')} & ${esc(s.bride||'新娘')}`);
  if(s.weddingDate){const d=dayDiff(s.weddingDate,todayStr());parts.push(d>0?`婚禮倒數 ${d} 天`:d===0?'今天結婚':fmtDate(s.weddingDate))}
  // 頁首與側邊欄的小字（新人名字、倒數天數）
  document.querySelectorAll('.subline').forEach(el=>el.innerHTML=parts.join(' · ')||'提親 → 訂婚 → 婚禮');
  // 側邊欄的分頁按鈕
  $('tabbar').innerHTML=VIEWS.map(v=>`<button class="tab" type="button" data-nav="${v.id}" ${v.id===state.view?'aria-current="page"':''}>${v.icon}<span>${v.name}</span></button>`).join('');
  const gate=store.mode==='cloud'&&(!state.user||state.authError);
  $('tabbar').hidden=!!gate;
  if(gate){
    $('view').innerHTML=state.authError
      ?`<section class="card login"><h2>無法開啟資料</h2><p>${esc(state.authError)}</p>${state.user?'<button class="btn" type="button" data-action="logout">換一個帳號登入</button>':'<button class="btn primary" type="button" data-action="login">用 Google 登入</button>'}</section>`
      :`<section class="card login"><h2>登入後開始使用</h2><p>用 Google 帳號登入，你和另一半會看到同一份資料，任何一方新增或修改，對方馬上就會看到。</p><button class="btn primary" type="button" data-action="login">用 Google 登入</button><p class="hint">只有擁有者允許的 Email 可以查看與編輯。</p></section>`;
    $('fab').hidden=true;return;
  }
  $('view').innerHTML=state.ready?R[state.view]():'<div class="empty" style="margin-top:16px">載入中…</div>';
  const f=FAB[state.view];$('fab').hidden=!f;if(f)$('fabLabel').textContent=f[0];
}
