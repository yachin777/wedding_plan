// ==========================================================
// js/views/calendar.js
// 「月曆」分頁：月份格子、每天的活動／期限圓點、點日期看當天項目。
// ==========================================================

// 月曆畫面
R.calendar=()=>{
  const [y,m]=state.calMonth.split('-').map(Number);
  const first=new Date(y,m-1,1),days=new Date(y,m,0).getDate(),lead=first.getDay(),t=todayStr();
  const ev={};
  const add=(d,kind,task)=>{if(!d||d.slice(0,7)!==state.calMonth)return;(ev[d]=ev[d]||[]).push({kind,task})};
  for(const k of state.tasks){add(k.date,'act',k);if(k.due&&k.due!==k.date)add(k.due,'due',k)}
  let cells=WD.split('').map((w,i)=>`<div class="wd ${i===0?'sun':''}">${w}</div>`).join('');
  for(let i=0;i<lead;i++)cells+=`<div class="day blank"></div>`;
  for(let d=1;d<=days;d++){
    const ds=`${state.calMonth}-${pad(d)}`,list=ev[ds]||[];
    const dots=list.slice(0,4).map(e=>`<i class="dot ${e.task.done?'done':e.kind==='due'?'dl':''}"></i>`).join('');
    const ms=milestonesOn(ds);   // 這天是不是提親／登記／訂婚／婚禮日
    cells+=`<button type="button" class="day ${ds===t?'today':''} ${ms.length?'wedding':''}" data-day="${ds}" aria-pressed="${ds===state.calDay}" aria-label="${m}月${d}日${ms.map(x=>'，'+x.name+'日').join('')}，${list.length} 項">
      ${ms.length?`<span class="xi">${ms.map(x=>x.mark).join('')}</span>`:''}<span class="dn num">${d}</span><span class="dots">${dots}</span></button>`;
  }
  const sel=state.calDay;
  const acts=state.tasks.filter(k=>k.date===sel),dues=state.tasks.filter(k=>k.due===sel&&k.date!==sel);
  const items=[...acts.map(k=>card(k,'<span class="lab">活動</span>')),...dues.map(k=>card(k,'<span class="lab dl">期限</span>'))].join('');
  return `<div class="view-h"><h2>月曆</h2><span>點日期看當天安排</span></div>
    <div class="cal-layout"><div>
    <div class="cal-h"><button type="button" data-cal="prev" aria-label="上個月">‹</button><b class="num">${y} 年 ${m} 月</b><button type="button" data-cal="next" aria-label="下個月">›</button><button type="button" data-cal="today">今天</button></div>
    <div class="cal">${cells}</div>
    <div class="legend"><span><i class="dot"></i>活動日期</span><span><i class="dot dl"></i>最後期限</span><span><i class="dot done"></i>已完成</span>${milestones().length?'<span><b style="color:var(--red);font-family:var(--serif)">提 登 訂 囍</b>各階段的日子</span>':''}</div>
    </div><div>
    <div class="sec-h">${fmtDate(sel)}${milestonesOn(sel).map(x=>' · '+x.name+'日').join('')}</div>
    <div class="list" style="margin-top:0">${items||`<div class="empty" style="padding:16px">這天沒有安排</div>`}</div>
    </div></div>`;
};
