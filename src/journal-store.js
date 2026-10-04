import {emptyJournal, SCHEMA} from './journal-model.js';
export class JournalStore {
  constructor(db) { this.db = db; this.value = null; this.queue = Promise.resolve(); }
  static async open() {
    const db = await new Promise((resolve,reject) => {
      const request = indexedDB.open('workout-review-journal', 1);
      request.onupgradeneeded = () => {request.result.createObjectStore('documents'); request.result.createObjectStore('backups', {autoIncrement:true});};
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(Error('別のタブを閉じて再読み込みしてください。'));
    });
    const store = new JournalStore(db);
    store.value = await new Promise((resolve,reject) => {
      const request = db.transaction('documents').objectStore('documents').get('journal');
      request.onsuccess = () => resolve(request.result || emptyJournal()); request.onerror = () => reject(request.error);
    });
    if (store.value.schema !== SCHEMA) throw Error('未対応の保存形式です。データは変更していません。');
    return store;
  }
  update(change, backup = false) {
    const next = this.queue.then(() => new Promise((resolve,reject) => {
      const tx = this.db.transaction(['documents','backups'], 'readwrite');
      const docs = tx.objectStore('documents');
      let result, failure;
      const request = docs.get('journal');
      request.onsuccess = () => {
        try {
          const current = request.result || emptyJournal();
          if (current.revision !== this.value.revision) throw Error('別タブでデータが更新されました。この画面の入力をバックアップしてから再読み込みしてください。');
          result = structuredClone(current);
          change(result);
          result.revision += 1;
          if (backup) tx.objectStore('backups').add({savedAt:new Date().toISOString(), journal: current});
          docs.put(result,'journal');
        } catch(error) { failure = error; tx.abort(); }
      };
      tx.oncomplete = () => {this.value = result; resolve(result);};
      tx.onabort = tx.onerror = () => reject(failure || tx.error || Error('保存できませんでした。空き容量とブラウザの保存設定を確認してください。'));
    }));
    this.queue = next.catch(() => {});
    return next;
  }
  async backupBundle() {
    await this.queue;
    const backups = await new Promise((resolve,reject) => {
      const request = this.db.transaction('backups').objectStore('backups').getAll();
      request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
    });
    return {format:'workout-review-backup', version:1, exportedAt:new Date().toISOString(), journal:this.value, backups};
  }
}
