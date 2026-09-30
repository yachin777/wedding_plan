// ==========================================================
// js/events.js
// 使用者操作：切換分頁、點按鈕、右下角新增、提示訊息。
// ==========================================================

// 切換分頁
function go(view){state.view=view;remember();closeNav();render();window.scrollTo(0,0)}
// 手機版側邊欄：打開／收起
function openNav(){$('sidebar').classList.add('open');$('navScrim').hidden=false}
function closeNav(){$('sidebar').classList.remove('open');$('navScrim').hidden=true}
$('navScrim').onclick=closeNav;
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('sidebar').classList.contains('open'))closeNav()});
// 右下角「新增」按鈕：依目前分頁打開對應的表單
$('fab').onclick=()=>{
  const f=FAB[state.view];if(!f)return;
  if(f[1]==='tasks'){const d={stage:state.stage,urgency:'一般',priority:'中'};if(state.view==='calendar')d.date=state.calDay;openForm('tasks',null,d)}
  else if(f[1]==='vendors')openForm('vendors',null,{status:'詢價中'});
  else{state.aseg='saved';render();openForm('articles',null,{})}
};
// 任務頁的類別篩選
document.addEventListener('change',e=>{if(e.target.id==='catFilter'){state.cat=e.target.value;render()}});
// 整個頁面的點擊：依被點元素上的 data-* 屬性決定動作
//   data-nav 切換分頁、data-edit 打開編輯、data-toggle 勾選完成、data-photo 放大照片、data-day 選日期…
let clearArmed=false;
document.addEventListener('click',async e=>{
  const t=e.target;
  if(t.closest('a')||t.closest('#scrim'))return;
  const el=sel=>t.closest(sel);
  let x;
  if(x=el('[data-photo]')){const [c,id,i]=x.dataset.photo.split(':');return openLightbox(c,id,+i)}
  if(x=el('[data-nav]'))return go(x.dataset.nav);
  if(x=el('[data-action="menu"]'))return openNav();
  if(x=el('[data-action="settings"]')){closeNav();if(store.mode==='cloud'&&!state.user)return;return openForm('settings')}
  if(x=el('[data-action="login"]'))return login();
  if(x=el('[data-action="logout"]'))return logout();
  if(x=el('[data-goto-stage]')){state.stage=x.dataset.gotoStage;state.cat='';return go('tasks')}
  if(x=el('[data-stage]')){state.stage=x.dataset.stage;state.cat='';remember();return render()}
  if(x=el('[data-f]')){state.filter=x.dataset.f;return render()}
  if(x=el('[data-vf]')){state.vfilter=x.dataset.vf;return render()}
  if(x=el('[data-aseg]')){state.aseg=x.dataset.aseg;return render()}
  if(x=el('[data-day]')){state.calDay=x.dataset.day;return render()}
  if(x=el('[data-cal]')){
    const [y,m]=state.calMonth.split('-').map(Number);
    if(x.dataset.cal==='today'){state.calMonth=todayStr().slice(0,7);state.calDay=todayStr()}
    else{const d=new Date(y,m-1+(x.dataset.cal==='next'?1:-1),1);state.calMonth=ymd(d).slice(0,7)}
    return render();
  }
  if(x=el('[data-toggle]')){const k=state.tasks.find(v=>v.id===x.dataset.toggle);if(!k)return;
    try{await store.save('tasks',{...k,done:!k.done,updatedAt:new Date().toISOString()});toast(k.done?'已標為未完成':'完成一項 ✓')}catch(err){toast(saveErrMsg(err))}
    return}
  if(x=el('[data-edit]')){const [c,id]=x.dataset.edit.split(':');const it=state[c]?.find(v=>v.id===id);if(it)openForm(c,it);return}
  if(t.id==='clearSamples'){
    if(!clearArmed){clearArmed=true;t.textContent='確定清除？';return}
    clearArmed=false;
    try{for(const k of state.tasks.filter(v=>v.sample))await store.remove('tasks',k.id);toast('已清除範例')}catch(err){toast(saveErrMsg(err))}
  }
});
// 畫面下方短暫出現的提示訊息（例如「已新增」）
let toastT;
function toast(m){const el=$('toast');el.textContent=m;el.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>el.hidden=true,2200)}
