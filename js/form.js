// ==========================================================
// js/form.js
// 新增／編輯表單：欄位定義、開啟與關閉、儲存與刪除。
// 想在表單加欄位，改最上面的 FIELDS。
// ==========================================================

// 各表單的欄位。k = 資料欄位名稱，t = 類型（text/number/date/time/select/seg/textarea/check/photos），
// label = 標題，req = 必填，full = 佔滿一整行，addNew = 下拉選單可「＋新增」。
// 想加欄位：在對應的表單裡加一行，表單就會自動出現（卡片上要顯示的話再改 components.js 或 views/）。
const FIELDS={
  tasks:[
    {k:'stage',t:'seg',label:'階段',req:1,opts:()=>STAGES.map(s=>[s.id,s.name])},
    {k:'item',t:'text',label:'項目',req:1,full:1,max:80,ph:'例如：預訂訂婚喜餅'},
    {k:'category',t:'select',label:'類別',opts:()=>state.opts.categories,addNew:'categories',newLabel:'新增類別'},
    {k:'owner',t:'select',label:'負責處理人',opts:()=>state.opts.people,addNew:'people',newLabel:'新增負責人'},
    {k:'startDate',t:'date',label:'開始日期'},{k:'due',t:'date',label:'最後期限'},   // 甘特圖用這兩個日期畫長條
    {k:'date',t:'date',label:'活動日期',full:1},
    {k:'start',t:'time',label:'開始時間'},{k:'end',t:'time',label:'結束時間'},
    {k:'urgency',t:'select',label:'急迫性',opts:()=>URGENCY},{k:'priority',t:'select',label:'優先等級',opts:()=>PRIORITY},
    {k:'cost',t:'number',label:'預估成本（元）'},{k:'actual',t:'number',label:'實際支出（元）'},
    {k:'note',t:'textarea',label:'備註',full:1,ph:'廠商聯絡方式、注意事項…'},
    {k:'photos',t:'photos',label:'照片'},
    {k:'done',t:'check',label:'已完成',editOnly:1}
  ],
  vendors:[
    {k:'name',t:'text',label:'廠商名稱',req:1,full:1,max:60,ph:'例如：○○婚宴會館'},
    {k:'category',t:'select',label:'類別',opts:()=>state.opts.categories,addNew:'categories',newLabel:'新增類別'},
    {k:'status',t:'select',label:'狀態',opts:()=>VENDOR_STATUS,noBlank:1},
    {k:'contact',t:'text',label:'聯絡人',max:30},{k:'phone',t:'tel',label:'電話',max:30},
    {k:'link',t:'text',label:'LINE ID 或網址',full:1,max:200,ph:'https://… 或 LINE ID'},
    {k:'location',t:'text',label:'廠商地點',full:1,max:120,ph:'地址或店名，例如：台北市信義區松仁路 100 號'},   // 卡片上會出現「地圖」連結
    {k:'pros',t:'textarea',label:'優點',ph:'一行寫一點，例如：\n交通方便\n菜色評價好'},
    {k:'cons',t:'textarea',label:'缺點',ph:'一行寫一點，例如：\n停車位少\n週末價格較高'},
    {k:'quote',t:'number',label:'報價（元）'},{k:'deposit',t:'number',label:'已付訂金（元）'},
    {k:'note',t:'textarea',label:'備註',full:1,ph:'方案內容、付款期限…'},
    {k:'photos',t:'photos',label:'照片'}
  ],
  articles:[
    {k:'title',t:'text',label:'標題',req:1,full:1,max:100},
    {k:'url',t:'url',label:'網址',full:1,max:500,ph:'https://'},
    {k:'category',t:'select',label:'分類',opts:()=>ARTICLE_CATS,full:1},
    {k:'note',t:'textarea',label:'筆記',full:1,ph:'重點整理…'},
    {k:'photos',t:'photos',label:'照片'}
  ],
  settings:[
    {k:'weddingDate',t:'date',label:'婚禮日期',full:1},
    {k:'groom',t:'text',label:'新郎',max:20},{k:'bride',t:'text',label:'新娘',max:20},
    {k:'budget',t:'number',label:'總預算（元）',full:1}
  ]
};
// 表單標題：[新增時, 編輯時]
const TITLES={tasks:['新增項目','編輯項目'],vendors:['新增廠商','編輯廠商'],articles:['收藏文章','編輯文章'],settings:['婚禮設定','婚禮設定']};
// 目前開著的表單：種類、正在編輯的資料、照片清單等
let form={kind:null,item:null,seg:{},delArmed:false,photos:[],removed:[],busy:0};

// 依欄位類型產生輸入框
function fieldHtml(f,v,isEdit){
  if(f.editOnly&&!isEdit)return '';
  if(f.t==='photos'){form.photos=(v||[]).map(p=>({...p}));form.removed=[];return `<div class="f full"><span class="lbl">${f.label}（最多 ${MAX_PHOTOS} 張）</span><div class="ph-grid" id="phGrid"></div></div>`}
  const id='f_'+f.k,lab=`${f.label}${f.req?' <em>*</em>':''}`,cls=`f ${f.full?'full':''}`;
  if(f.t==='seg'){form.seg[f.k]=v;return `<div class="f full"><span class="lbl">${lab}</span><div class="seg" data-segk="${f.k}">${f.opts().map(([val,l])=>`<button type="button" data-seg="${val}" aria-pressed="${val===v}">${l}</button>`).join('')}</div></div>`}
  if(f.t==='check')return `<label class="chk"><input type="checkbox" id="${id}" ${v?'checked':''}> ${f.label}</label>`;
  if(f.t==='textarea')return `<div class="${cls}"><label for="${id}">${lab}</label><textarea id="${id}" maxlength="1000" placeholder="${esc(f.ph||'')}">${esc(v||'')}</textarea></div>`;
  if(f.t==='select'){
    const list=[...f.opts()];if(v&&!list.includes(v))list.push(v);
    const opts=(f.noBlank?'':`<option value="">— 未指定 —</option>`)+list.map(o=>`<option ${o===v?'selected':''}>${esc(o)}</option>`).join('')+(f.addNew?`<option value="${NEW}">＋ ${f.newLabel}</option>`:'');
    return `<div class="${cls}"><label for="${id}">${lab}</label><select id="${id}" data-addnew="${f.addNew?1:''}">${opts}</select></div>`+
      (f.addNew?`<div class="f" id="${id}_wrap" hidden><label for="${id}_new">${f.newLabel}名稱</label><input id="${id}_new" maxlength="12"></div>`:'');
  }
  const type={number:'number',date:'date',time:'time',tel:'tel',url:'url'}[f.t]||'text';
  const extra=f.t==='number'?'inputmode="numeric" min="0" step="100"':'';
  const val=f.t==='number'?(v?v:''):(v||'');
  return `<div class="${cls}"><label for="${id}">${lab}</label><input type="${type}" id="${id}" ${extra} ${f.max?`maxlength="${f.max}"`:''} placeholder="${esc(f.ph||'')}" value="${esc(val)}" autocomplete="off"></div>`;
}
// 打開表單。kind = tasks/vendors/articles/settings；item = 要編輯的資料（新增時不傳）；defaults = 新增時的預設值
function openForm(kind,item,defaults){
  const isEdit=!!item;form={kind,item:item||null,seg:{},delArmed:false,photos:[],removed:[],busy:0};
  const base=kind==='settings'?state.settings:(item||defaults||{});
  $('formTitle').textContent=TITLES[kind][isEdit?1:0];
  $('formBody').innerHTML=FIELDS[kind].map(f=>fieldHtml(f,base[f.k],isEdit)).join('')+
    (kind==='settings'?settingsExtra():'')+
    `<p class="err" id="fErr" hidden></p>`;
  if($('phGrid'))renderPhotoGrid();
  $('delBtn').hidden=!(isEdit&&kind!=='settings');$('delBtn').textContent='刪除';$('delBtn').classList.remove('arm');
  $('scrim').hidden=false;document.body.style.overflow='hidden';
  const first=FIELDS[kind].find(f=>f.req&&f.t!=='seg');
  if(!isEdit&&first)setTimeout(()=>$('f_'+first.k)?.focus(),60);
}
// 婚禮設定表單下方的資訊：登入帳號、登出、上傳舊資料
function settingsExtra(){
  if(store.mode==='cloud'&&state.user){
    const b=store.localBackup();
    return `<div class="acct"><span>已登入：${esc(state.user.email)}<br><small style="color:var(--ink-3)">資料存在雲端，和另一半即時同步</small></span><button class="btn" type="button" data-action="logout">登出</button></div>`+
      (b?`<div class="acct"><span>這台裝置上有 ${b.n} 筆之前存在瀏覽器裡的資料，還沒放到雲端。</span><button class="btn primary" type="button" id="migrateBtn">上傳到雲端</button></div>`:'');
  }
  if(store.mode==='claude')return '';
  return `<p class="hint" style="grid-column:1/-1;margin:0">資料存在這支手機或這台電腦的瀏覽器裡；換裝置或清除瀏覽器資料就看不到了。</p>`;
}

// 關閉表單
function closeForm(){$('scrim').hidden=true;document.body.style.overflow='';form.kind=null}
// 在表單下方顯示錯誤訊息
function showErr(m){$('fErr').textContent=m;$('fErr').hidden=false}
// 儲存失敗時的中文說明
function saveErrMsg(err){
  const c=err?.code;
  if(c==='permission_denied'||c==='not_granted')return '你目前只有檢視權限，無法儲存。請擁有者給你編輯權限。';
  if(c==='quota_exceeded')return '資料數量已達上限，請先刪除部分項目。';
  if(c==='local_quota')return '這個瀏覽器的儲存空間不夠放照片了。請登入雲端版，或刪掉一些照片。';
  return '儲存失敗，請檢查網路後再試一次。';
}
// 表單內的變動：選了照片、下拉選單選了「＋新增」
$('formBody').addEventListener('change',e=>{
  if(e.target.id==='phInput'){const fl=e.target.files;if(fl?.length)addPhotos(fl);return}
  const s=e.target;if(s.tagName==='SELECT'&&s.dataset.addnew){const w=$(s.id+'_wrap');w.hidden=s.value!==NEW;if(s.value===NEW)$(s.id+'_new').focus()}
});
// 表單內的點擊：移除照片、登出、上傳舊資料、切換階段按鈕
$('formBody').addEventListener('click',async e=>{
  const rm=e.target.closest('[data-rmph]');
  if(rm){const [p]=form.photos.splice(+rm.dataset.rmph,1);if(p&&!p.isNew)form.removed.push(p);renderPhotoGrid();return}
  if(e.target.closest('[data-action="logout"]'))return logout();
  if(e.target.id==='migrateBtn'){
    e.target.disabled=true;e.target.textContent='上傳中…';
    try{const n=await store.migrate();closeForm();toast(`已上傳 ${n} 筆資料到雲端`)}catch(err){showErr('上傳失敗：'+(err?.message||'請稍後再試'));e.target.disabled=false;e.target.textContent='上傳到雲端'}
    return;
  }
  const b=e.target.closest('[data-seg]');if(!b)return;const k=b.parentElement.dataset.segk;form.seg[k]=b.dataset.seg;
  b.parentElement.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));
});
// 按「儲存」：檢查必填 → 存照片 → 存資料 → 關閉表單
$('form').onsubmit=async e=>{
  e.preventDefault();
  const {kind,item}=form,isEdit=!!item,out={};let optsChanged=false;
  if(form.busy){showErr('照片還在處理中，請稍等一下');return}
  for(const f of FIELDS[kind]){
    if(f.t==='photos')continue;
    if(f.editOnly&&!isEdit){out[f.k]=false;continue}
    const el=$('f_'+f.k);let v;
    if(f.t==='seg')v=form.seg[f.k]||'';
    else if(f.t==='check')v=el.checked;
    else if(f.t==='number'){v=el.value===''?0:Number(el.value);if(!(v>=0)){showErr(`${f.label}需為 0 以上的數字`);return}}
    else v=el.value.trim();
    if(f.t==='select'&&v===NEW){
      v=$('f_'+f.k+'_new').value.trim();if(!v){showErr(`請輸入${f.newLabel}名稱`);return}
      if(!state.opts[f.addNew].includes(v)){state.opts[f.addNew].push(v);optsChanged=true}
    }
    if(f.req&&!v){showErr(`請填寫${f.label}`);return}
    out[f.k]=v;
  }
  if(kind==='tasks'&&out.start&&out.end&&out.end<out.start){showErr('結束時間要晚於開始時間');return}
  if(kind==='articles'&&out.url&&!safeUrl(out.url)){showErr('網址請以 http:// 或 https:// 開頭');return}
  $('saveBtn').disabled=true;
  try{
    if(optsChanged)await store.saveMeta('options');
    if(kind==='settings'){state.settings={...state.settings,...out};await store.saveMeta('settings');closeForm();toast('設定已儲存');render();return}
    if(FIELDS[kind].some(f=>f.t==='photos')){
      for(const p of form.photos.filter(p=>p.isNew)){await store.savePhoto(p.id,p.full);p.isNew=false;delete p.full}
      out.photos=form.photos.map(p=>({id:p.id,thumb:p.thumb}));
    }
    const now=new Date().toISOString();
    const obj={...(item||{}),...out,id:item?.id||store.newId(kind),createdAt:item?.createdAt||now,updatedAt:now};
    await store.save(kind,obj);
    for(const p of form.removed)store.removePhoto(p.id).catch(()=>{});
    if(kind==='tasks'&&obj.stage!==state.stage&&state.view==='tasks'){state.stage=obj.stage;remember()}
    closeForm();toast(isEdit?'已更新':'已新增');render();
  }catch(err){showErr(saveErrMsg(err))}
  finally{$('saveBtn').disabled=false}
};
// 刪除：第一次按變成「確定刪除？」，再按一次才真的刪除
$('delBtn').onclick=async()=>{
  if(!form.delArmed){form.delArmed=true;$('delBtn').textContent='確定刪除？';$('delBtn').classList.add('arm');return}
  try{const ph=form.item.photos||[];await store.remove(form.kind,form.item.id);ph.forEach(p=>store.removePhoto(p.id).catch(()=>{}));closeForm();toast('已刪除')}catch(err){showErr(saveErrMsg(err))}
};
// 關閉表單的方式：× 按鈕、取消、點背景、按 Esc
$('closeBtn').onclick=$('cancelBtn').onclick=closeForm;
$('scrim').onclick=e=>{if(e.target===$('scrim'))closeForm()};
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&!$('scrim').hidden)closeForm();
  if(e.key==='Enter'&&e.target.matches('.vcard'))e.target.click();
});
