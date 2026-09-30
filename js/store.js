// ==========================================================
// js/store.js
// 資料存取：新增／修改／刪除資料都經過這裡。
// 會依情況自動選擇三種儲存方式之一：
//   cloud  = Firebase 雲端（firebase-config.js 有填設定值時；需要 Google 登入，多人即時同步）
//   claude = 在 Claude 上開啟時使用 Claude 的資料庫
//   local  = 只存在這個瀏覽器（沒有設定 Firebase 時）
// ==========================================================

// 會存到資料庫的三種資料（也是 Firestore 裡的集合名稱）
const COLS=['tasks','vendors','articles'];
const store={
  db:null,mode:'local',fs:null,unsubs:[],
  // 啟動：決定用哪一種儲存方式，並開始接收資料
  async init(){
    let db=null;
    try{ if(window.claude?.use) db=await window.claude.use('db'); }catch{}
    if(db){this.mode='claude';this.attach(db);return}
    const cfg=window.FIREBASE_CONFIG;
    if(cfg&&cfg.apiKey&&window.firebase){
      this.mode='cloud';
      try{
        firebase.initializeApp(cfg);
        this.fs=firebase.firestore();
        this.fs.enablePersistence({synchronizeTabs:true}).catch(()=>{});
        const auth=firebase.auth();
        auth.getRedirectResult().catch(e=>{state.authError=authMsg(e);render()});
        auth.onAuthStateChanged(u=>{
          this.detach();resetData();
          state.user=u?{email:u.email||'',name:u.displayName||''}:null;
          state.authError='';
          if(u){state.ready=false;this.attach(this.fs)}else state.ready=true;
          render();
        });
      }catch(e){state.authError='Firebase 設定有誤：'+e.message;state.ready=true;render()}
      return;
    }
    try{const raw=JSON.parse(localStorage.getItem('wp-local')||'null');
      if(raw){for(const c of COLS)state[c]=raw[c]||[];if(raw.opts)state.opts=raw.opts;if(raw.settings)state.settings={...DEFAULT_SETTINGS,...raw.settings}}}catch{}
    state.ready=true;render();
  },
  // 連上資料庫後即時監聽變動（另一半新增資料時，畫面會自動更新）
  attach(db){
    this.db=db;
    const pending=new Set(COLS);
    const fail=e=>{
      if(e&&(e.code==='permission-denied'||e.code==='permission_denied'))state.authError=`這個帳號（${state.user?.email||''}）沒有權限查看資料。請確認擁有者已把這個 Email 加進 Firebase 的安全規則。`;
      else toast('與資料庫的連線中斷，請重新整理頁面');
      state.ready=true;render();
    };
    for(const c of COLS){
      this.unsubs.push(db.collection(c).onSnapshot(snap=>{
        state[c]=snap.docs.map(d=>({id:d.id,...d.data()}));
        pending.delete(c);if(!pending.size)state.ready=true;render();
      },fail));
    }
    this.unsubs.push(db.doc('meta/options').onSnapshot(s=>{
      const d=s.exists?s.data():null;
      if(d){state.opts={categories:d.categories?.length?[...d.categories]:[...DEFAULT_OPTS.categories],people:d.people?.length?[...d.people]:[...DEFAULT_OPTS.people]};render()}
    },()=>{}));
    this.unsubs.push(db.doc('meta/settings').onSnapshot(s=>{if(s.exists){state.settings={...DEFAULT_SETTINGS,...s.data()};render()}},()=>{}));
  },
  // 停止監聽（登出時）
  detach(){this.unsubs.forEach(f=>{try{f()}catch{}});this.unsubs=[];this.db=null},
  // 讀取這個瀏覽器裡的舊資料（婚禮設定裡的「上傳到雲端」會用到）
  localBackup(){try{const raw=JSON.parse(localStorage.getItem('wp-local')||'null');if(!raw)return null;const n=COLS.reduce((a,c)=>a+(raw[c]?.length||0),0);return n?{raw,n}:null}catch{return null}},
  // 把瀏覽器裡的舊資料與照片搬到雲端
  async migrate(){
    const b=this.localBackup();if(!b||!this.db)return 0;
    const batch=this.fs.batch();let n=0;
    for(const c of COLS)for(const it of (b.raw[c]||[])){const {id,...body}=it;batch.set(this.fs.collection(c).doc(id||this.newId(c)),body);n++}
    if(b.raw.settings&&!state.settings.weddingDate&&!state.settings.budget)batch.set(this.fs.doc('meta/settings'),{...DEFAULT_SETTINGS,...b.raw.settings});
    if(b.raw.opts)batch.set(this.fs.doc('meta/options'),{categories:[...new Set([...state.opts.categories,...(b.raw.opts.categories||[])])],people:[...new Set([...state.opts.people,...(b.raw.opts.people||[])])]});
    await batch.commit();
    for(const c of COLS)for(const it of (b.raw[c]||[]))for(const p of (it.photos||[])){
      let d=null;try{d=localStorage.getItem('wp-photo-'+p.id)}catch{}
      if(d){await this.fs.collection('photos').doc(p.id).set({data:d,createdAt:new Date().toISOString()});try{localStorage.removeItem('wp-photo-'+p.id)}catch{}}
    }
    try{localStorage.setItem('wp-local-uploaded',localStorage.getItem('wp-local'));localStorage.removeItem('wp-local')}catch{}
    return n;
  },
  // 照片：存、讀、刪。完整大小的照片另外存在 photos 集合，資料本身只存縮圖
  async savePhoto(id,data){
    if(this.db){await this.db.collection('photos').doc(id).set({data,createdAt:new Date().toISOString()});return}
    if(this.mode!=='local')throw {code:'permission_denied'};
    try{localStorage.setItem('wp-photo-'+id,data)}catch{throw {code:'local_quota'}}
  },
  async getPhoto(id){
    if(this.db){const s=await this.db.collection('photos').doc(id).get();return s.exists?s.data().data:null}
    try{return localStorage.getItem('wp-photo-'+id)}catch{return null}
  },
  async removePhoto(id){
    if(this.db){await this.db.collection('photos').doc(id).delete();return}
    try{localStorage.removeItem('wp-photo-'+id)}catch{}
  },
  // 產生新資料的唯一代碼
  newId(c){return this.db?this.db.collection(c).doc().id:c[0]+Date.now().toString(36)+Math.random().toString(36).slice(2,6)},
  // 本機模式：把全部資料存進瀏覽器
  persistLocal(){try{localStorage.setItem('wp-local',JSON.stringify({tasks:state.tasks,vendors:state.vendors,articles:state.articles,opts:state.opts,settings:state.settings}))}catch{toast('這個瀏覽器無法儲存資料')}},
  // 新增或修改一筆資料（c = tasks/vendors/articles）
  async save(c,item){
    const {id,...body}=item;
    if(this.db){await this.db.collection(c).doc(id).set(body);return}
    if(this.mode!=='local')throw {code:'permission_denied'};
    const list=state[c],i=list.findIndex(t=>t.id===id);
    if(i>=0)list[i]=item;else list.push(item);
    this.persistLocal();render();
  },
  // 刪除一筆資料
  async remove(c,id){
    if(this.db){await this.db.collection(c).doc(id).delete();return}
    state[c]=state[c].filter(t=>t.id!==id);this.persistLocal();render();
  },
  // 儲存選單（options）或婚禮設定（settings）
  async saveMeta(name){
    const body=name==='options'?{categories:state.opts.categories,people:state.opts.people}:{...state.settings};
    if(this.db){await this.db.doc('meta/'+name).set(body);return}
    this.persistLocal();render();
  }
};

// 清空畫面上的資料（登出或換帳號時）
function resetData(){for(const c of COLS)state[c]=[];state.opts=structuredClone(DEFAULT_OPTS);state.settings={...DEFAULT_SETTINGS}}
