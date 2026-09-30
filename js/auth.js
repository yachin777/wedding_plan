// ==========================================================
// js/auth.js
// Google 登入／登出（只在 Firebase 雲端模式使用）。
// ==========================================================

// 把 Firebase 登入錯誤轉成中文說明
function authMsg(e){
  const c=e?.code||'';
  if(c==='auth/unauthorized-domain')return '這個網址還沒加到 Firebase 的「授權網域」，請到 Firebase 主控台 → Authentication → 設定 → 授權網域加入 '+location.hostname;
  if(c==='auth/popup-closed-by-user'||c==='auth/cancelled-popup-request')return '';
  if(c==='auth/network-request-failed')return '網路連線失敗，請稍後再試。';
  return '登入失敗：'+(e?.message||c);
}
// 用 Google 帳號登入（跳出視窗；被瀏覽器擋下時改成整頁跳轉）
async function login(){
  const auth=firebase.auth(),p=new firebase.auth.GoogleAuthProvider();
  p.setCustomParameters({prompt:'select_account'});
  try{await auth.signInWithPopup(p)}
  catch(e){
    if(['auth/popup-blocked','auth/operation-not-supported-in-this-environment','auth/web-storage-unsupported'].includes(e.code))return auth.signInWithRedirect(p);
    state.authError=authMsg(e);render();
  }
}
// 登出
async function logout(){closeForm();state.authError='';await firebase.auth().signOut()}
