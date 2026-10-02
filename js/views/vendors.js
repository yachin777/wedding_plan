// ==========================================================
// js/views/vendors.js
// 「廠商」分頁：廠商統計、狀態篩選、廠商卡片。
// ==========================================================

// 優點／缺點：每一行顯示成一點，優點綠色＋、缺點紅色－
function prosCons(v){
  const list=(txt,cls,sign)=>String(txt||'').split('\n').map(s=>s.trim()).filter(Boolean)
    .map(s=>`<li class="${cls}"><b aria-hidden="true">${sign}</b>${esc(s)}</li>`).join('');
  const p=list(v.pros,'pro','＋'),c=list(v.cons,'con','－');
  if(!p&&!c)return '';
  return `<div class="pc">${p?`<ul aria-label="優點">${p}</ul>`:''}${c?`<ul aria-label="缺點">${c}</ul>`:''}</div>`;
}
// 廠商畫面
R.vendors=()=>{
  const V=state.vendors,signed=V.filter(v=>v.status==='已簽約');
  const sum=(l,k)=>l.reduce((s,v)=>s+(+v[k]||0),0);
  const list=state.vfilter==='all'?[...V]:V.filter(v=>v.status===state.vfilter);
  const rank={'已簽約':0,'詢價中':1,'不考慮':2};
  list.sort((a,b)=>((rank[a.status]??3)-(rank[b.status]??3))||String(a.category||'').localeCompare(String(b.category||''))||String(a.name).localeCompare(String(b.name)));
  const stCls={'已簽約':'st-ok','詢價中':'st-wait','不考慮':'st-no'};
  const cards=list.map(v=>{
    const url=safeUrl(v.link);
    const contact=[
      v.contact?`<span>${esc(v.contact)}</span>`:'',
      v.phone?`<a href="tel:${esc(String(v.phone).replace(/[^\d+]/g,''))}">${esc(v.phone)}</a>`:'',
      v.link?(url?`<a href="${esc(url)}" target="_blank" rel="noopener">${esc(host(url)||'網站')}</a>`:`<span>LINE：${esc(v.link)}</span>`):''
    ].join('');
    const m2=[v.quote?`<span>報價 ${money(v.quote)}</span>`:'',v.deposit?`<span>已付訂金 ${money(v.deposit)}</span>`:''].join('');
    return `<div class="vcard ${v.status==='不考慮'?'muted':''}" role="button" tabindex="0" data-edit="vendors:${esc(v.id)}">
      <div class="vtop"><b>${esc(v.name)}</b>${v.status?`<span class="tag ${stCls[v.status]||''}">${esc(v.status)}</span>`:''}</div>
      ${v.category?`<div class="tags"><span class="tag cat">${esc(v.category)}</span></div>`:''}
      ${contact?`<div class="contact">${contact}</div>`:''}
      ${v.location?`<div class="v-loc"><span>地點：${esc(v.location)}</span><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.location)}" target="_blank" rel="noopener">地圖</a></div>`:''}
      ${m2?`<div class="facts num">${m2}</div>`:''}
      ${prosCons(v)}
      ${v.note?`<div class="note">${esc(v.note)}</div>`:''}${thumbsHtml(v,'vendors')}</div>`}).join('');
  const chip=(f,l)=>`<button class="chip" type="button" data-vf="${f}" aria-pressed="${state.vfilter===f}">${l}</button>`;
  return `<div class="view-h"><h2>廠商</h2><span>${V.length} 家</span></div>
    <section class="kpis num">
      <div class="kpi good"><span>已簽約</span><b>${signed.length} 家</b></div>
      <div class="kpi"><span>詢價中</span><b>${V.filter(v=>v.status==='詢價中').length} 家</b></div>
      <div class="kpi"><span>簽約總額</span><b>${money(sum(signed,'quote'))}</b></div>
      <div class="kpi"><span>已付訂金</span><b>${money(sum(V,'deposit'))}</b></div>
    </section>
    <div class="chips">${chip('all','全部')}${VENDOR_STATUS.map(s=>chip(s,s)).join('')}</div>
    <div class="list grid">${cards||`<div class="empty">${V.length?'沒有這個狀態的廠商':'還沒有廠商資料<br>點右下角「新增廠商」，記下婚宴場地、婚紗、新秘的聯絡方式與報價'}</div>`}</div>`;
};
