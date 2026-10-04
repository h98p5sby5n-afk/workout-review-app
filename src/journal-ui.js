import {uid, dayKey, newDraft, blankSet, equipmentLabel, sessionFromDraft, attendance, seedEquipment, workoutSignature, sessionWorkout} from './journal-model.js';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const option = (value,label,current) => `<option value="${esc(value)}" ${value === current ? 'selected' : ''}>${esc(label)}</option>`;
const gymName = (id,j) => j.gyms.find(g => g.id === id)?.name || 'ジム未設定';
const bodyOptions = ['胸','背中','肩','脚','腕','体幹','有酸素','その他'];
export function createJournalUI({store, root, getWorkouts, changed, parseWorkout, parseInBody, navigate}) {
  let draft = structuredClone(store.value.draft), catalog = structuredClone(store.value.catalogDraft);
  let month = dayKey().slice(0,7), selectedDay = dayKey(), busy = false, importBusy = false, storageFailed = false;
  let catalogOpen = Boolean(catalog), pendingPhoto = false;
  let tabId;
  try {tabId = sessionStorage.getItem('journal-tab') || uid(); sessionStorage.setItem('journal-tab',tabId);} catch {tabId=uid();}
  const recoveryKey = `workout-review.pending.${tabId}`;
  const status = document.querySelector('#journalStatus');
  function message(text,error=false) {status.textContent=text; status.classList.toggle('error',error);}
  function recovery() {
    try {localStorage.setItem(recoveryKey,JSON.stringify({draft,catalog}));} catch {message('入力の一時保全に失敗しました。保存完了を確認してから画面を閉じてください。',true);}
  }
  function clearRecovery(snapshot) {try {if(localStorage.getItem(recoveryKey)===snapshot) localStorage.removeItem(recoveryKey);} catch { /* Database remains authoritative. */ }}
  async function persistDrafts() {
    recovery(); const snapshot=JSON.stringify({draft,catalog}), d=structuredClone(draft), c=structuredClone(catalog);
    try {await store.update(j => {j.draft=d; j.catalogDraft=c;}); clearRecovery(snapshot); storageFailed=false; message('入力途中もこの端末に保存済み');}
    catch(e) {storageFailed=true; message(e.message,true); throw e;}
  }
  function field(label,name,value,type='text',extra='') {return `<label>${label}<input name="${name}" type="${type}" value="${esc(value)}" ${extra}></label>`;}
  function render() {
    const j=store.value, days=attendance(getWorkouts()), currentDays=[...days.keys()].filter(k=>k.startsWith(month));
    const counts=new Map(); currentDays.forEach(k=>days.get(k).gyms.forEach(g=>counts.set(g,(counts.get(g)||0)+1)));
    root.innerHTML=`<section class="home-hero"><div><p class="eyebrow">YOUR TRAINING JOURNAL</p><h2>今日の積み重ねを、記録に。</h2><p>前回のセットを見ながら、自分のペースで。</p></div><button type="button" class="primary-button" data-action="start">${draft ? '入力中の記録へ' : '＋ トレーニングを記録'}</button></section>
      <div class="home-layout"><section class="panel journal-editor" id="journalEditor">${renderEditor(j)}</section>
      <section class="panel calendar-panel"><div class="panel-head"><div><p class="eyebrow">ACTIVITY</p><h2>ジムのカレンダー</h2></div><span class="attendance-count">${currentDays.length}<small> 日 / 月</small></span></div>
      <div class="calendar-toolbar"><button type="button" data-action="prev-month" aria-label="前の月">‹</button><label class="month-label"><span class="sr-only">表示月</span><input id="calendarMonth" type="month" value="${month}"></label><button type="button" data-action="next-month" aria-label="次の月">›</button></div>
      ${renderCalendar(days)}<div class="gym-legend">${[...counts].map(([g,n])=>`<span><i style="background:${gymColor(g,j)}"></i>${esc(gymName(g,j))} ${n}日</span>`).join('') || '<p class="muted">この月の実績はまだありません。</p>'}</div><p class="muted calendar-help">● 保存済み実績のみ。複数ジムは色を分けて表示。場所不明は灰色。</p>
      <div class="day-records"><h3>${esc(selectedDay)} の記録</h3>${renderSessions(days.get(selectedDay)?.sessions || [],j)}</div></section></div>
      <details class="panel catalog-panel" ${catalogOpen ? 'open' : ''}><summary>ジム・機材・メモを管理 <span>写真と使い方を、ひとつに</span></summary><div class="catalog-layout"><div><h3>ジム</h3><button type="button" data-action="new-gym">＋ ジムを追加</button><div class="catalog-list">${j.gyms.map(g=>`<button type="button" data-action="edit-gym" data-id="${g.id}">${esc(g.name)} <small>名称変更</small></button>`).join('')}</div><h3>機材・メニュー</h3><button type="button" data-action="new-equipment">＋ 機材・メニューを追加</button><label class="catalog-search">機材を探す<input type="search" id="catalogSearch" placeholder="名前・ジム・メーカー"></label><div class="catalog-list equipment-list">${j.equipment.map(e=>`<button type="button" data-action="edit-equipment" data-id="${e.id}" data-search="${esc(`${e.name} ${gymName(e.gymId,j)} ${e.manufacturer}`)}">${e.photo ? `<img src="${esc(e.photo)}" alt="">` : '<span class="machine-placeholder" aria-hidden="true">▤</span>'}<span>${esc(e.name)}<small>${esc(gymName(e.gymId,j))}${e.manufacturer ? ' · '+esc(e.manufacturer) : ''}</small></span></button>`).join('')}</div></div><div id="catalogEditor">${renderCatalog(j)}</div></div></details>
      <section class="panel recent-panel"><div class="panel-head"><div><p class="eyebrow">RECENT</p><h2>最近の記録</h2></div><button type="button" data-action="history">グラフ・全履歴へ →</button></div>${renderSessions(getWorkouts().filter(w=>w.source !== 'sample').slice(0,12),j)}</section>
      <section class="panel backup-panel"><h3>この端末のデータ</h3><p>記録・写真・メモ・読み込んだCSVはこのブラウザ内に保存されます。ブラウザのデータ消去や機種変更に備え、バックアップを保管してください。</p><button type="button" data-action="backup">バックアップを書き出す</button><label class="file-label">バックアップを復元<input type="file" id="restoreBackup" accept=".json,application/json"></label></section>`;
    root.querySelector('.catalog-panel').addEventListener('toggle',e=>{catalogOpen=e.target.open;});
  }
  function gymColor(id,j) {return id ? ['#2f7d64','#8062bb','#d77b3c','#3784ad','#c0527a'][Math.max(0,j.gyms.findIndex(g=>g.id===id))%5] : '#8b949e';}
  function renderCalendar(days) {
    const [year,m]=month.split('-').map(Number), first=new Date(year,m-1,1), last=new Date(year,m,0).getDate();
    let cells=Array(first.getDay()).fill('<span class="calendar-blank"></span>');
    for(let n=1;n<=last;n++) {const key=`${month}-${String(n).padStart(2,'0')}`, day=days.get(key); cells.push(`<button type="button" class="calendar-day ${day ? 'trained' : ''} ${key===selectedDay ? 'selected' : ''} ${key===dayKey() ? 'today' : ''}" data-action="day" data-day="${key}" aria-pressed="${key===selectedDay}" aria-label="${esc(`${key} ${day ? [...day.gyms].map(g=>gymName(g,store.value)).join('、') : '記録なし'}`)}"><span>${n}</span><span class="day-dots">${day ? [...day.gyms].map(g=>`<i style="background:${gymColor(g,store.value)}"></i>`).join('') : ''}</span></button>`);}
    return `<div class="calendar-grid">${['日','月','火','水','木','金','土'].map(d=>`<span class="weekday">${d}</span>`).join('')}${cells.join('')}</div>`;
  }
  function renderSessions(workouts,j) {
    if(!workouts.length) return '<p class="empty-note">まだ記録がありません。小さな一歩から始めましょう。</p>';
    return workouts.map(w=>`<details class="session-row"><summary><span><strong>${esc(dayKey(w.date))} ${esc(w.name)}</strong><small>${esc([...new Set(w.exercises.map(e=>gymName(e.gymId,j)))].join(' / '))} · ${w.exercises.reduce((n,e)=>n+e.sets.length,0)}セット · ${w.source==='manual' ? '手入力' : 'CSV'}</small></span><span aria-hidden="true">＋</span></summary><div class="session-content">${w.exercises.map(e=>`<p><strong>${esc(e.name)}</strong><br>${e.sets.map(s=>s.reps!==null ? `${esc(s.weightKg)}kg × ${esc(s.reps)}回` : `${esc(s.timeSec || 0)}秒 / ${esc(s.distanceM || 0)}m`).join(' / ')}</p>`).join('')}${w.notes ? `<p class="long-note">${esc(w.notes)}</p>` : ''}${w.source==='manual' ? `<button type="button" data-action="edit-session" data-id="${w.id}">この記録を編集</button>` : '<p class="muted">取り込み元CSVを保持しています。場所の推測・過去データの書き換えはしません。</p>'}</div></details>`).join('');
  }
  function renderEditor(j) {
    if(!draft) return '<p class="eyebrow">START HERE</p><h2>今日、どんなトレーニングを？</h2><p class="empty-note">機材を選ぶと前回のセットを確認できます。ジムは機材から自動で引き継ぎます。</p><button type="button" data-action="start" class="primary-button">＋ 記録を始める</button>';
    const editing=j.sessions.some(s=>s.id===draft.id);
    return `<form id="workoutForm"><div class="panel-head"><h2>${editing ? '記録を編集' : 'トレーニングを記録'}</h2><span class="draft-tag">${editing ? '編集内容を下書き保存' : '下書き自動保存'}</span></div><div class="field-grid">${field('記録日','date',draft.date,'date',`required max="${dayKey()}"`)}${field('開始時刻','time',draft.time,'time','required')}</div>${field('タイトル（任意）','name',draft.name,'text','placeholder="今日のトレーニング"')}
      <div class="workout-exercises">${draft.exercises.map((entry,i)=>renderEntry(entry,i,j)).join('')}</div>
      <div class="add-exercise"><label>機材・メニュー<select id="equipmentPicker"><option value="">選択してください</option>${j.equipment.map(e=>option(e.id,equipmentLabel(e,j),'')).join('')}</select></label><button type="button" data-action="add-exercise">＋ 追加</button></div><button class="text-button" type="button" data-action="new-equipment">一覧にない機材を登録 →</button>
      <label>この日のメモ<textarea name="notes" rows="3" placeholder="コンディションや気づき">${esc(draft.notes)}</textarea></label><div class="form-actions"><button type="submit" class="primary-button" ${busy ? 'disabled' : ''}>${editing ? '変更を保存' : '記録を保存'}</button><button type="button" data-action="discard">${editing ? '編集を取り消す' : '下書きを破棄'}</button></div></form>`;
  }
  function renderEntry(entry,i,j) {
    const e=j.equipment.find(e=>e.id===entry.equipmentId); if(!e) return '';
    const history=getWorkouts().filter(w=>w.id!==draft.id).flatMap(w=>w.exercises.filter(x=>x.equipmentId===e.id).map(x=>({date:w.date,e:x}))).slice(0,3);
    const previous=history[0];
    return `<article class="entry-card"><div class="entry-heading">${e.photo ? `<img class="equipment-photo" src="${esc(e.photo)}" alt="${esc(e.name)}の写真">` : ''}<div><h3>${esc(e.name)}</h3><p>${esc(gymName(entry.gymId,j))}${e.loadMode==='assist' ? ' · 補助重量' : ''}</p><small>${esc([e.manufacturer,e.officialName].filter(Boolean).join(' / '))}</small></div><button type="button" data-action="remove-exercise" data-index="${i}" aria-label="${esc(e.name)}を記録から除く">×</button></div>
      ${e.notes ? `<details class="equipment-note"><summary>使い方・機材メモ</summary><p class="long-note">${esc(e.notes)}</p></details>` : ''}
      <details class="previous-record"><summary>${previous ? '前回 '+dayKey(previous.date)+' · '+previous.e.sets.map(s=>s.reps!==null ? `${s.weightKg}kg×${s.reps}` : `${s.timeSec || 0}秒`).join(' / ') : 'この機材の過去記録はありません'}</summary>${history.map(h=>`<p>${esc(dayKey(h.date))}：${h.e.sets.map(s=>s.reps!==null ? `${s.weightKg}kg × ${s.reps}回` : `${s.timeSec || 0}秒`).join(' / ')}</p>`).join('')}${previous ? `<button type="button" data-action="copy-sets" data-index="${i}">前回のセットを入力にコピー</button>` : ''}</details>
      <div class="sets-table ${e.type==='cardio'?'cardio':''}"><div class="set-head"><span>#</span>${(e.type==='cardio'?['秒','m','kcal']:['kg','回','休憩 秒']).map(x=>`<span>${x}</span>`).join('')}<span></span></div>${entry.sets.map((s,k)=>`<div class="set-row"><span>${k+1}</span>${(e.type==='cardio'?['timeSec','distanceM','energyKcal']:['weightKg','reps','restSec']).map(key=>`<input type="number" inputmode="${key==='reps'?'numeric':'decimal'}" min="${key==='reps'?'1':'0'}" step="${key==='reps'?'1':'any'}" value="${esc(s[key])}" data-entry="${i}" data-set="${k}" data-field="${key}" aria-label="${esc(e.name)} セット${k+1} ${({weightKg:'重量 kg',reps:'回数',restSec:'休憩 秒',timeSec:'時間 秒',distanceM:'距離 m',energyKcal:'消費 kcal'})[key]}">`).join('')}<button type="button" data-action="remove-set" data-index="${i}" data-set="${k}" aria-label="セット${k+1}を削除">×</button></div>`).join('')}</div><button type="button" data-action="add-set" data-index="${i}">＋ セット</button><p class="muted">${entry.gymId ? '記録時のジムを保持します。' : '場所は未設定のまま保存されます。機材管理でジムを設定後、追加し直すと引き継ぎます。'}</p></article>`;
  }
  function renderCatalog(j) {
    if(!catalog) return '<div class="empty-note"><h3>自分だけの機材ノート</h3><p>使うジムを紐付けて、写真・メーカー・正式名称・長文メモを保存できます。同じ種目の別機材はそれぞれ追加してください。</p></div>';
    if(catalog.kind==='gym') return `<form id="catalogForm"><h3>${j.gyms.some(g=>g.id===catalog.id)?'ジムの名称変更':'ジムを追加'}</h3>${field('ジム名','name',catalog.name,'text','required')}<button type="submit" class="primary-button">ジムを保存</button></form>`;
    return `<form id="catalogForm"><h3>機材・メニューを編集</h3>${field('表示名','name',catalog.name,'text','required')}<div class="field-grid"><label>利用ジム<select name="gymId">${option('','未設定',catalog.gymId)}${j.gyms.map(g=>option(g.id,g.name,catalog.gymId)).join('')}</select></label><label>部位<select name="body">${[...new Set([...bodyOptions,catalog.body])].filter(Boolean).map(b=>option(b,b,catalog.body)).join('')}</select></label></div><div class="field-grid"><label>記録形式<select name="type">${option('strength','筋力（重量・回数）',catalog.type)}${option('cardio','有酸素（時間・距離）',catalog.type)}</select></label><label>重量の意味<select name="loadMode">${option('load','負荷重量 / 自重',catalog.loadMode)}${option('assist','補助重量',catalog.loadMode)}</select></label></div>${field('メーカー（分かる場合のみ）','manufacturer',catalog.manufacturer)}${field('正式な機材名（分かる場合のみ）','officialName',catalog.officialName)}<label>機材メモ<textarea name="notes" rows="9" placeholder="Life Fitnessのメモをそのまま貼り付けられます。シート位置、使い方など。">${esc(catalog.notes)}</textarea></label>${catalog.photo ? `<img class="catalog-photo" src="${esc(catalog.photo)}" alt="登録する機材写真"><button type="button" data-action="remove-photo">写真を外す</button>` : ''}<div class="photo-actions"><label class="file-label">写真を選択<input type="file" id="photoPicker" accept="image/jpeg,image/png,image/webp,image/heic,image/heif"></label><label class="file-label">写真を撮影<input type="file" id="photoCamera" accept="image/*" capture="environment"></label></div><p class="muted">端末内で縮小して保存。写真は外部に送信されません。</p><button type="submit" class="primary-button" ${pendingPhoto?'disabled':''}>機材を保存</button><p class="muted">名称変更は過去記録にも反映。ジム変更は新しく追加する記録から適用します。</p></form>`;
  }
  async function openCatalog(value) {
    if(catalog && !confirm('入力中の管理フォームを閉じて別の項目を開きますか？')) return;
    catalog=value;catalogOpen=true; await persistDrafts();render();root.querySelector('#catalogEditor').scrollIntoView({behavior:'smooth',block:'start'});
  }
  async function perform(action,button) {
    const j=store.value, index=Number(button.dataset.index);
    if(action==='start') {if(!draft){draft=newDraft();await persistDrafts();render();} root.querySelector('#journalEditor').scrollIntoView({behavior:'smooth'});return;}
    if(action==='history') {navigate('training');return;}
    if(action==='backup') {await downloadBackup();return;}
    if(action==='prev-month'||action==='next-month') {const [y,m]=month.split('-').map(Number);month=dayKey(new Date(y,m-1+(action==='next-month'?1:-1),1)).slice(0,7);render();return;}
    if(action==='day') {selectedDay=button.dataset.day;render();return;}
    if(action==='new-gym') {await openCatalog({kind:'gym',id:uid(),name:''});return;}
    if(action==='edit-gym') {await openCatalog({kind:'gym',...structuredClone(j.gyms.find(g=>g.id===button.dataset.id))});return;}
    if(action==='new-equipment') {await openCatalog({kind:'equipment',id:uid(),name:'',gymId:'',manufacturer:'',officialName:'',notes:'',photo:'',body:'その他',type:'strength',loadMode:'load'});return;}
    if(action==='edit-equipment') {await openCatalog({kind:'equipment',...structuredClone(j.equipment.find(e=>e.id===button.dataset.id))});return;}
    if(action==='remove-photo') {catalog.photo='';await persistDrafts();render();return;}
    if(action==='edit-session') {if(draft && !confirm('入力中の下書きを閉じて、この記録を編集しますか？'))return;draft=structuredClone(j.sessions.find(s=>s.id===button.dataset.id));await persistDrafts();render();root.querySelector('#journalEditor').scrollIntoView({behavior:'smooth'});return;}
    if(!draft)return;
    if(action==='discard') {if(!confirm('下書きの変更を破棄しますか？保存済み記録は残ります。'))return;draft=null;}
    if(action==='add-exercise') {const e=j.equipment.find(e=>e.id===root.querySelector('#equipmentPicker').value);if(!e){message('機材・メニューを選んでください。',true);return;}draft.exercises.push({id:uid(),equipmentId:e.id,gymId:e.gymId,sets:[blankSet()]});}
    if(action==='remove-exercise') {if(!confirm('この機材の入力を下書きから除きますか？'))return;draft.exercises.splice(index,1);}
    if(action==='add-set') {const e=draft.exercises[index];e.sets.push({...e.sets.at(-1)||blankSet()});}
    if(action==='remove-set') {if(!confirm('このセットの入力を削除しますか？'))return;draft.exercises[index].sets.splice(Number(button.dataset.set),1);}
    if(action==='copy-sets') {const e=draft.exercises[index], previous=getWorkouts().filter(w=>w.id!==draft.id).flatMap(w=>w.exercises).find(x=>x.equipmentId===e.equipmentId);if(previous && confirm('入力中のセットを前回の内容に置き換えますか？'))e.sets=previous.sets.map(s=>Object.fromEntries(Object.keys(blankSet()).map(k=>[k,s[k]??''])));}
    await persistDrafts();render();
  }
  root.addEventListener('click',e=>{const button=e.target.closest('[data-action]');if(!button||busy)return;busy=true;button.disabled=true;perform(button.dataset.action,button).catch(err=>message(err.message,true)).finally(()=>{busy=false;button.disabled=false;root.querySelectorAll('button[type="submit"]').forEach(b=>b.disabled=pendingPhoto);});});
  root.addEventListener('input',e=>{
    const target=e.target;
    if(target.id==='catalogSearch') {root.querySelectorAll('[data-search]').forEach(b=>b.hidden=!b.dataset.search.toLowerCase().includes(target.value.toLowerCase()));return;}
    if(target.closest('#workoutForm')&&draft) {if(target.dataset.field) draft.exercises[Number(target.dataset.entry)].sets[Number(target.dataset.set)][target.dataset.field]=target.value;else if(['date','time','name','notes'].includes(target.name))draft[target.name]=target.value;else return;}
    else if(target.closest('#catalogForm')&&catalog&&target.name) catalog[target.name]=target.value;
    else return;
    persistDrafts().catch(()=>{});
  });
  root.addEventListener('change',e=>{
    if(e.target.id==='calendarMonth'&&/^\d{4}-\d{2}$/.test(e.target.value)){month=e.target.value;render();}
    if(['photoPicker','photoCamera'].includes(e.target.id)) loadPhoto(e.target.files[0]).catch(err=>message(err.message,true));
    if(e.target.id==='restoreBackup') restoreBackup(e.target.files[0]).catch(err=>message(err.message,true));
  });
  root.addEventListener('submit',async e=>{
    e.preventDefault();if(busy||pendingPhoto)return;busy=true;e.submitter.disabled=true;e.target.querySelectorAll('input,select,textarea').forEach(x=>x.disabled=true);
    try {
      await store.queue;
      if(e.target.id==='workoutForm') {
        const previousSession=store.value.sessions.find(s=>s.id===draft.id);
        if(previousSession && previousSession.updatedAt!==draft.updatedAt) throw Error('この記録は別の画面で更新済みです。入力をバックアップし、最新の記録から編集し直してください。');
        const session=sessionFromDraft(draft,store.value);
        const candidate=sessionWorkout(session,store.value);
        const duplicates=getWorkouts().filter(w=>w.source!=='sample'&&w.id!==session.id&&workoutSignature(w,true)===workoutSignature(candidate,true));
        if(duplicates.length&&!confirm('同じ日・同じセットの記録が既にあります。別の実績として保存しますか？'))return;
        await store.update(j=>{const i=j.sessions.findIndex(s=>s.id===session.id);if(i<0)j.sessions.push(session);else j.sessions[i]=session;j.draft=null;},true);
        draft=null;storageFailed=false;try{localStorage.removeItem(recoveryKey);}catch{/* IndexedDB still holds the saved data. */} selectedDay=session.date;month=session.date.slice(0,7);changed();render();message('記録を保存しました。おつかれさまでした！');
      } else if(e.target.id==='catalogForm') {
        if(!catalog.name.trim())throw Error('名前を入力してください。');
        const value=structuredClone(catalog);value.name=value.name.trim();delete value.kind;
        if(catalog.kind==='equipment' && store.value.sessions.some(s=>s.exercises.some(e=>e.equipmentId===value.id))) {
          const previous=store.value.equipment.find(e=>e.id===value.id);
          if(previous.type!==value.type||previous.loadMode!==value.loadMode)throw Error('記録のある機材の形式・重量の意味は変更できません。別の機材として追加してください。');
        }
        await store.update(j=>{const list=catalog.kind==='gym'?j.gyms:j.equipment;const i=list.findIndex(x=>x.id===value.id);if(i<0)list.push(value);else list[i]=value;j.catalogDraft=null;},true);
        catalog=null;storageFailed=false;changed();render();message('保存しました。過去記録のIDは維持されています。');
      }
    } catch(err) {storageFailed=true;message(err.message,true);recovery();}
    finally {busy=false;root.querySelectorAll('input,select,textarea,button[type="submit"]').forEach(b=>b.disabled=false);}
  });
  async function loadPhoto(file) {
    if(!file||!catalog)return;
    if(!file.type.startsWith('image/'))throw Error('画像ファイルを選択してください。');
    if(file.size>20*1024*1024)throw Error('20MB以下の写真を選んでください。');
    pendingPhoto=true;const id=catalog.id; const buttons=[...root.querySelectorAll('#catalogForm button[type="submit"]')];buttons.forEach(b=>b.disabled=true);
    const url=URL.createObjectURL(file);
    try {const img=new Image();img.src=url;await img.decode();const scale=Math.min(1,1600/Math.max(img.width,img.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);if(catalog?.id!==id)return;catalog.photo=canvas.toDataURL('image/jpeg',0.8);await persistDrafts();render();}
    catch {throw Error('写真を読み込めませんでした。JPEG・PNG形式でもう一度選択してください。');}
    finally {URL.revokeObjectURL(url);pendingPhoto=false;root.querySelectorAll('#catalogForm button[type="submit"]').forEach(b=>b.disabled=false);}
  }
  async function downloadBackup() {
    const bundle=await store.backupBundle();bundle.pending={draft,catalog};bundle.legacy={};
    for(const key of ['workout-review.csvText.v1','workout-review.csvName.v1','workout-review.inbodyCsvText.v1','workout-review.inbodyCsvName.v1']){try{bundle.legacy[key]=localStorage.getItem(key);}catch{/* IndexedDB still holds the saved data. */}}
    const url=URL.createObjectURL(new Blob([JSON.stringify(bundle)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`workout-backup-${dayKey()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);message('バックアップを書き出しました。健康情報を含むため、ご自身で保管してください。');
  }
  async function restoreBackup(file) {
    if(!file)return;
    if(busy)throw Error('保存完了後に復元してください。');
    const bundle=JSON.parse(await file.text()), value=bundle.journal;
    if(bundle.format!=='workout-review-backup'||value?.schema!==1||!['gyms','equipment','sessions','imports','inbodyImports'].every(k=>Array.isArray(value[k])))throw Error('このアプリのバックアップJSONではありません。');
    if(value.equipment.some(e=>e.photo&&!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(e.photo)))throw Error('写真の形式が無効です。');
    if(value.imports.some(b=>typeof b.text!=='string'||!parseWorkout(b.text).length)||value.inbodyImports.some(b=>typeof b.text!=='string'||!parseInBody(b.text).length))throw Error('バックアップのCSVを検証できませんでした。');
    for(const k of ['gyms','equipment','sessions'])if(value[k].some(x=>typeof x.id!=='string'||!/^[a-zA-Z0-9_-]+$/.test(x.id)))throw Error('バックアップのIDが無効です。');
    value.sessions.forEach(s=>sessionFromDraft(s,value));
    if(!confirm('バックアップを追加復元します。同じIDの既存項目は変更せず、新しい項目のみ追加します。続けますか？'))return;
    busy=true;
    try {await store.update(j=>{for(const key of ['gyms','equipment','sessions','imports','inbodyImports'])for(const item of value[key])if(!j[key].some(x=>x.id===item.id))j[key].push(item);if(!j.draft&&value.draft)j.draft=value.draft;if(!j.catalogDraft&&value.catalogDraft)j.catalogDraft=value.catalogDraft;},true);draft=structuredClone(store.value.draft);catalog=structuredClone(store.value.catalogDraft);changed();render();message('追加復元しました。同じIDの項目は現在の内容を保持しています。');}
    finally{busy=false;}
  }
  async function importCsv(text,name,kind) {
    if(importBusy)throw Error('別のCSVを読み込み中です。完了後にもう一度選択してください。');
    importBusy=true;
    try {
      const records=kind==='workout'?parseWorkout(text):parseInBody(text);
      if(!records.length || (kind==='workout' && records.some(w=>!Number.isFinite(w.date.getTime()) || !w.exercises.length)))throw Error('有効な履歴を読み取れませんでした。既存データは変更していません。');
      const key=kind==='workout'?'imports':'inbodyImports';
      if(store.value[key].some(b=>b.text===text)){message('このCSVは取り込み済みです。');return;}
      const excluded=[];
      if(kind==='workout') {
        const manual=getWorkouts().filter(w=>w.source==='manual');
        const possible=records.filter(w=>manual.some(m=>dayKey(m.date)===dayKey(w.date)));
        if(possible.length) {
          const decisions=await reviewImport(possible,manual);if(decisions===null){message('CSVの取り込みを取り消しました。');return;}excluded.push(...decisions);
        }
      }
      await store.update(j=>{j[key].push({id:uid(),name,text,excluded,importedAt:new Date().toISOString()});if(kind==='workout')seedEquipment(j,records);},true);
      changed();render();message(`${name} を追加しました。取り込み前のデータは端末内にバックアップ済みです。`);
    } finally {importBusy=false;}
  }
  function reviewImport(records,manual) {
    return new Promise(resolve=>{
      const dialog=document.createElement('dialog');dialog.className='import-review';
      dialog.innerHTML=`<form method="dialog"><h2>手入力と同じ日の履歴があります</h2><p>重複を避けるため、追加したいCSV実績だけチェックしてください。除外した内容も元CSVとして保存します。</p>${records.map((w,i)=>`<label class="review-record"><input type="checkbox" name="include" value="${i}"><span><strong>${esc(dayKey(w.date))} ${esc(w.name)}</strong><small>CSV：${esc(w.exercises.map(e=>`${e.name} ${e.sets.map(s=>s.reps!==null?`${s.weightKg}kg×${s.reps}`:`${s.timeSec||0}秒`).join('/')}`).join('、'))}</small><small>手入力：${esc(manual.filter(m=>dayKey(m.date)===dayKey(w.date)).map(m=>m.exercises.map(e=>`${e.name} ${e.sets.map(s=>s.reps!==null?`${s.weightKg}kg×${s.reps}`:`${s.timeSec||0}秒`).join('/')}`).join('、')).join(' / '))}</small></span></label>`).join('')}<div class="form-actions"><button value="apply" class="primary-button">選択内容で取り込む</button><button value="cancel">取り消す</button></div></form>`;
      document.body.append(dialog);dialog.addEventListener('close',()=>{const included=new Set([...dialog.querySelectorAll('input:checked')].map(x=>Number(x.getAttribute('value'))));const result=dialog.returnValue==='apply'?records.filter((_,i)=>!included.has(i)).map(w=>workoutSignature(w)):null;dialog.remove();resolve(result);});dialog.showModal();
    });
  }
  try {const pending=JSON.parse(localStorage.getItem(recoveryKey)||'null');if(pending){if(JSON.stringify(pending)!==JSON.stringify({draft,catalog})){draft=pending.draft;catalog=pending.catalog;message('前回保存が完了しなかった入力を復元しました。内容を確認して保存してください。');}else {localStorage.removeItem(recoveryKey);}}} catch {message('一時入力の読み込みに失敗しました。保存済みデータは保持しています。',true);}
  window.addEventListener('beforeunload',e=>{if(storageFailed||pendingPhoto||importBusy){e.preventDefault();e.returnValue='';}});
  window.addEventListener('pagehide',()=>{if(draft||catalog)recovery();});
  render();
  if(status.textContent.includes('読み込み中')) message('この端末に保存 · 外部送信なし');
  return {render,importCsv,message,downloadBackup};
}
