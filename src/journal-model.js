// Raw imports are immutable; display models are rebuilt from these records.
export const SCHEMA = 1;
export const uid = () => crypto.randomUUID();
/** @param {Date | string | number} [date] */
export function dayKey(date = new Date()) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
export function emptyJournal() {
  return {schema: SCHEMA, revision: 0, gyms: [], equipment: [], sessions: [], imports: [], inbodyImports: [], draft: null, catalogDraft: null, migrated: false};
}
export function newDraft() {
  return {id: uid(), date: dayKey(), time: new Date().toTimeString().slice(0,5), name: '', notes: '', exercises: []};
}
export function blankSet() { return {weightKg: '', reps: '', restSec: '', distanceM: '', timeSec: '', energyKcal: ''}; }
export function seedEquipment(journal, workouts) {
  for (const workout of workouts) for (const e of workout.exercises) {
    if (!journal.equipment.some(item => item.importName === e.name)) {
      journal.equipment.push({id: uid(), name: e.name, importName: e.name, body: e.body, loadMode: e.loadMode, type: e.type === 'cardio' ? 'cardio' : 'strength', gymId: '', manufacturer: '', officialName: '', notes: e.notes || '', photo: ''});
    }
  }
}
export function equipmentLabel(item, journal) {
  const gym = journal.gyms.find(g => g.id === item.gymId)?.name;
  return `${item.name} · ${gym || 'ジム未設定'}` + (journal.equipment.filter(e => e.name === item.name && e.gymId === item.gymId).length > 1 ? ` (${item.id.slice(0,6)})` : '');
}
export function validateDraft(draft, journal) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.date) || !Number.isFinite(new Date(`${draft.date}T12:00`).getTime()) || dayKey(`${draft.date}T12:00`) !== draft.date) throw Error('記録日を入力してください。');
  if (draft.date > dayKey()) throw Error('未来の日付は実績として保存できません。');
  if (!/^\d{2}:\d{2}$/.test(draft.time) || !Number.isFinite(new Date(`${draft.date}T${draft.time}`).getTime())) throw Error('開始時刻を入力してください。');
  if (!draft.exercises.length) throw Error('機材・メニューを1つ以上追加してください。');
  for (const entry of draft.exercises) {
    const equipment = journal.equipment.find(e => e.id === entry.equipmentId);
    if (!equipment) throw Error('機材が見つかりません。');
    if (!entry.sets.length) throw Error(`${equipment.name}にセットを追加してください。`);
    for (const set of entry.sets) {
      const keys = equipment.type === 'cardio' ? ['timeSec'] : ['weightKg', 'reps'];
      for (const key of keys) if (String(set[key] ?? '').trim() === '') throw Error(`${equipment.name}の${key === 'weightKg' ? '重量（自重は0）' : key === 'reps' ? '回数' : '時間（秒）'}を入力してください。`);
      for (const [key,value] of Object.entries(set)) {
        if (!['weightKg','reps','restSec','distanceM','timeSec','energyKcal'].includes(key) || value === '') continue;
        if (!Number.isFinite(Number(value)) || Number(value) < 0 || (key === 'reps' && (!Number.isInteger(Number(value)) || Number(value) < 1))) throw Error('重量・回数・時間には有効な0以上の数値（回数は1以上の整数）を入力してください。');
      }
      if (equipment.type === 'cardio' && Number(set.timeSec) <= 0) throw Error('有酸素の時間は0より大きくしてください。');
    }
  }
}
export function sessionFromDraft(draft, journal) {
  validateDraft(draft, journal);
  return {...structuredClone(draft), updatedAt: new Date().toISOString(), source: 'manual', exercises: draft.exercises.map(e => ({...structuredClone(e), gymId: e.gymId ?? journal.equipment.find(m => m.id === e.equipmentId)?.gymId ?? ''}))};
}
export function sessionWorkout(session, journal) {
  return {id: session.id, source: 'manual', date: new Date(`${session.date}T${session.time}`), name: session.name || 'トレーニング', notes: session.notes, totalTimeMin: 0, totalVolumeTon: 0, exercises: session.exercises.map(entry => {
    const equipment = journal.equipment.find(e => e.id === entry.equipmentId);
    const loadMode = equipment?.loadMode || 'load';
    return {name: equipment ? equipmentLabel(equipment, journal) : '未設定の機材', rawName: equipment?.importName || equipment?.name || '', equipmentId: entry.equipmentId, gymId: entry.gymId, body: equipment?.body || 'その他', loadMode, timeMin: 0, sets: entry.sets.map((set,i) => {
      const num = key => set[key] === '' || set[key] == null ? null : Number(set[key]);
      const strength = equipment?.type !== 'cardio';
      const reps = strength ? num('reps') : null, weightKg = strength ? num('weightKg') : null;
      return {index: i+1, reps, weightKg, weightLb: null, distanceMiles: null, restSec: num('restSec') || 0, distanceM: strength ? null : num('distanceM'), timeSec: strength ? null : num('timeSec'), energyKcal: strength ? null : num('energyKcal'), volumeKg: (reps || 0)*(weightKg || 0), e1rmKg: reps !== null && weightKg !== null && loadMode === 'load' ? weightKg*(1+reps/30) : null};
    })};
  })};
}
export function workoutSignature(w, daily = false) {
  return JSON.stringify([daily ? dayKey(w.date) : new Date(w.date).toISOString(), ...(daily ? [] : [w.name]), w.exercises.map(e => [e.rawName || e.name, e.sets.map(s => [s.reps, s.weightKg, s.distanceM, s.timeSec, s.energyKcal, s.restSec])]).sort((a,b) => a[0].localeCompare(b[0]))]);
}
export function importedWorkouts(journal, parser) {
  const seen = new Set(), result = [];
  for (const batch of journal.imports) {
    for (const workout of parser(batch.text)) {
      if (!Number.isFinite(workout.date.getTime())) continue;
      const signature = workoutSignature(workout);
      if (seen.has(signature) || batch.excluded?.includes(signature)) continue;
      seen.add(signature);
      workout.source = 'import';
      // A CSV exercise name does not establish which physical gym it was used in.
      for (const e of workout.exercises) {
        const equipment = journal.equipment.find(item => item.importName === e.name);
        e.rawName = e.name;
        e.equipmentId = equipment?.id || '';
        e.gymId = ''; // Never rewrite unknown historical locations from today's assignment.
        if (equipment) e.name = equipmentLabel(equipment, journal);
      }
      result.push(workout);
    }
  }
  return result;
}
export function attendance(workouts) {
  const result = new Map();
  for (const w of workouts) {
    if (w.source === 'sample' || dayKey(w.date) > dayKey() || !w.exercises.some(e => e.sets.length)) continue;
    const key = dayKey(w.date);
    if (!result.has(key)) result.set(key, {sessions: [], gyms: new Set()});
    const day = result.get(key); day.sessions.push(w);
    w.exercises.forEach(e => { if (e.sets.length) day.gyms.add(e.gymId || ''); });
  }
  return result;
}
