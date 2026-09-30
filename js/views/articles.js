// ==========================================================
// js/views/articles.js
// 「文章」分頁：禮俗指南（內容在 GUIDE）與我的收藏。
// ==========================================================

// 禮俗指南內容：t = 標題、s = 副標、b = 內文（HTML）。想修改說明文字直接改這裡
const GUIDE=[
  {t:'提親',s:'正式向女方家提出婚事',b:`<p>男方帶著父母或長輩（有時會請媒人）到女方家拜訪，正式表達結婚的意願。</p>
    <ul><li>伴手禮常見水果禮盒、茶葉、喜糖等，數量多取雙數。</li>
    <li>雙方家長通常會討論：訂婚與結婚日期（不少家庭會請老師合八字擇日）、聘金與大小聘、喜餅盒數、採用六禮或十二禮、宴客方式與桌數。</li>
    <li>新人最好事先和各自家長溝通好想法，當天比較不容易卡住。</li></ul>`},
  {t:'訂婚（文定）',s:'六禮、十二禮與儀式流程',b:`<p><b>聘禮：</b>六禮、十二禮的內容各地不同，常見項目有聘金（大聘、小聘）、喜餅、禮香禮燭與炮竹、四色糖、金飾、衣料鞋襪等；十二禮會在六禮之外再加其他禮品。女方通常會回禮，並退回部分聘金或禮品。</p>
    <p><b>常見流程：</b></p>
    <ol><li>男方帶聘禮到女方家（納采），女方收下聘禮。</li>
    <li>新娘奉甜茶給男方親友。</li>
    <li>男方親友喝完甜茶，把紅包放在茶杯裡回給新娘（壓茶甌）。</li>
    <li>新娘坐在椅子上、腳放在矮凳，由新郎為新娘戴戒指，再由新娘為新郎戴。</li>
    <li>祭祖，接著是訂婚宴。</li></ol>`},
  {t:'迎娶',s:'結婚當天從男方出發到入新房',b:`<ol><li>男方祭祖後，禮車出發迎娶（常見取雙數車）。</li>
    <li>到女方家後，常有伴娘設計的闖關遊戲，新郎給紅包、完成任務後接新娘。</li>
    <li>新人拜別女方父母。</li>
    <li>新娘出門上車，女方家長潑水、新娘丟扇，象徵嫁出後不再帶走娘家的壞脾氣。</li>
    <li>到男方家後，常見過火爐、踩瓦片等習俗，再進入新房。</li></ol>`},
  {t:'婚宴與歸寧',s:'宴客、送客與回娘家',b:`<ul><li>婚宴結束時，新人在門口捧喜糖送客。</li>
    <li>歸寧（回門）是婚後新娘第一次回娘家，常見在婚後第三天，也有家庭依習俗擇日或與婚宴合併；女方有時會在這天宴請親友。</li></ul>`},
  {t:'常見禁忌',s:'是否遵守可與家人討論',b:`<ul><li>安床後到新婚夜之前，新床不讓別人睡；有些家庭會請生肖屬龍的男孩翻床。</li>
    <li>婚前一段時間避免參加喪禮。</li>
    <li>新娘出門時由媒人或長輩撐黑傘或米篩遮頭。</li>
    <li>訂婚、結婚當天避免說不吉利的話。</li></ul>`}
];
// 文章畫面：guide = 禮俗指南，saved = 我的收藏
R.articles=()=>{
  const seg=`<div class="seg-bar"><button type="button" data-aseg="guide" aria-pressed="${state.aseg==='guide'}">禮俗指南</button><button type="button" data-aseg="saved" aria-pressed="${state.aseg==='saved'}">我的收藏${state.articles.length?' '+state.articles.length:''}</button></div>`;
  if(state.aseg==='guide'){
    return `<div class="view-h"><h2>文章</h2></div>${seg}
      <div class="guide" style="margin-top:14px">${GUIDE.map((g,i)=>`<details ${i===0?'open':''}><summary>${g.t}<small>${g.s}</small></summary><div class="body">${g.b}</div></details>`).join('')}</div>
      <p class="hint">各地習俗差異很大，以上是常見做法，實際安排以雙方家長討論為準。</p>`;
  }
  const A=[...state.articles].sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
  const cards=A.map(a=>{const url=safeUrl(a.url);
    return `<div class="vcard" role="button" tabindex="0" data-edit="articles:${esc(a.id)}">
      <div class="vtop"><b>${esc(a.title)}</b>${a.category?`<span class="tag cat">${esc(a.category)}</span>`:''}</div>
      ${url?`<div class="contact"><a href="${esc(url)}" target="_blank" rel="noopener">開啟文章 · ${esc(host(url))}</a></div>`:''}
      ${a.note?`<div class="note">${esc(a.note)}</div>`:''}${thumbsHtml(a,'articles')}</div>`}).join('');
  return `<div class="view-h"><h2>文章</h2></div>${seg}
    <div class="list grid">${cards||`<div class="empty">還沒有收藏的文章<br>看到好用的喜餅比較、婚紗心得，點右下角「收藏文章」存起來</div>`}</div>`;
};
