// ==========================================================
// js/photos.js
// 照片：選照片、自動壓縮、表單裡的照片區，以及點縮圖放大檢視。
// ==========================================================

// 表單裡的照片區：已選的照片（可按 × 移除）＋「加入照片」按鈕
function renderPhotoGrid(){
  const g=$('phGrid');if(!g)return;
  let h=form.photos.map((p,i)=>`<div class="ph"><img src="${esc(p.thumb)}" alt="照片 ${i+1}"><button type="button" data-rmph="${i}" aria-label="移除照片 ${i+1}">×</button></div>`).join('');
  for(let i=0;i<form.busy;i++)h+=`<div class="ph-busy">處理中…</div>`;
  if(form.photos.length+form.busy<MAX_PHOTOS)h+=`<label class="ph-add"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="15" rx="2"/><circle cx="12" cy="12.5" r="3.5"/><path d="M8 5l1.5-2h5L16 5"/></svg><span>加入照片</span><input type="file" id="phInput" accept="image/*" multiple aria-label="加入照片"></label>`;
  g.innerHTML=h;
}
// 讀取使用者選的照片檔（會自動轉正手機直拍的照片）
async function loadImg(file){
  if(window.createImageBitmap){try{return await createImageBitmap(file,{imageOrientation:'from-image'})}catch{}}
  return await new Promise((res,rej)=>{const u=URL.createObjectURL(file);const im=new Image();im.onload=()=>res(im);im.onerror=()=>rej(new Error('bad'));im.src=u});
}
// 把照片縮到最長邊 max 像素，轉成 JPEG（q = 品質 0~1）
function toJpeg(img,max,q){
  const w0=img.naturalWidth||img.width,h0=img.naturalHeight||img.height,sc=Math.min(1,max/Math.max(w0,h0));
  const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w0*sc));c.height=Math.max(1,Math.round(h0*sc));
  const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(img,0,0,c.width,c.height);
  return c.toDataURL('image/jpeg',q);
}
// 每張照片產生兩種尺寸：完整圖（約 1280px，太大會再縮）與縮圖（200px）
async function processImage(file){
  const img=await loadImg(file);
  let full=toJpeg(img,1280,.8);
  if(full.length>700000)full=toJpeg(img,1024,.7);
  if(full.length>700000)full=toJpeg(img,800,.6);
  return {full,thumb:toJpeg(img,200,.7)};
}
// 加入照片（超過每筆上限 MAX_PHOTOS 的會略過）
async function addPhotos(files){
  const room=MAX_PHOTOS-form.photos.length-form.busy;
  const list=[...files].filter(f=>/^image\//.test(f.type)||/\.(jpe?g|png|webp|gif|heic|heif)$/i.test(f.name)).slice(0,Math.max(0,room));
  if(files.length>room)toast(`每筆最多 ${MAX_PHOTOS} 張，多的已略過`);
  form.busy+=list.length;renderPhotoGrid();
  for(const f of list){
    try{const r=await processImage(f);form.photos.push({id:store.newId('photos'),thumb:r.thumb,full:r.full,isNew:true})}
    catch{showErr(`「${f.name}」無法讀取，請改用 JPG 或 PNG 照片`)}
    form.busy--;renderPhotoGrid();
  }
}

// ---------- 點縮圖後的放大檢視 ----------
// fullCache：已下載的完整照片；lb：目前在看的照片清單與第幾張
const fullCache={};let lb={list:[],i:0};
// 打開放大檢視（c = 資料種類，id = 哪一筆，i = 第幾張）
function openLightbox(c,id,i){const it=state[c]?.find(v=>v.id===id);if(!it?.photos?.length)return;lb={list:it.photos,i};$('lightbox').hidden=false;document.body.style.overflow='hidden';showLb()}
// 顯示目前這張：先顯示縮圖，完整照片下載好再替換
async function showLb(){
  const p=lb.list[lb.i],multi=lb.list.length>1;
  $('lbPrev').hidden=$('lbNext').hidden=!multi;$('lbCount').textContent=multi?`${lb.i+1} / ${lb.list.length}`:'';
  $('lbImg').src=fullCache[p.id]||p.thumb;$('lbImg').alt=`照片 ${lb.i+1}`;
  if(!fullCache[p.id]){try{const d=await store.getPhoto(p.id);if(d){fullCache[p.id]=d;if(lb.list[lb.i]?.id===p.id&&!$('lightbox').hidden)$('lbImg').src=d}}catch{}}
}
// 關閉放大檢視
function closeLb(){$('lightbox').hidden=true;if($('scrim').hidden)document.body.style.overflow=''}
// 上一張／下一張
function stepLb(d){lb.i=(lb.i+d+lb.list.length)%lb.list.length;showLb()}
$('lbClose').onclick=closeLb;$('lbPrev').onclick=()=>stepLb(-1);$('lbNext').onclick=()=>stepLb(1);
$('lightbox').addEventListener('click',e=>{if(e.target.id==='lightbox')closeLb()});
document.addEventListener('keydown',e=>{if($('lightbox').hidden)return;if(e.key==='Escape')closeLb();if(e.key==='ArrowLeft')stepLb(-1);if(e.key==='ArrowRight')stepLb(1)});
// 手機左右滑動切換照片
let lbX=null;$('lightbox').addEventListener('touchstart',e=>{lbX=e.touches[0].clientX},{passive:true});
$('lightbox').addEventListener('touchend',e=>{if(lbX==null||lb.list.length<2)return;const dx=e.changedTouches[0].clientX-lbX;lbX=null;if(Math.abs(dx)>50)stepLb(dx<0?1:-1)});
