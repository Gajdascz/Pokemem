import { deserialize, serialize } from './serializer/index';
import { type Subscriber, Emitter } from '../Emitter/index';

export type ChangeEvent = 'preSave' | 'postSave';
export type LocalStorageEmitter<D> = Emitter<{ [E in ChangeEvent]: D | null }>;
export type LocalStorageSubscriber<D> = Subscriber<D | null>;

const defaultBrowserExportFn =
  (storageKey: string, storageRef: Storage) =>
  ({ filename = 'data', ext = 'json' } = {}) => {
    const data = storageRef.getItem(storageKey);
    if (!data) throw new Error(`No data found for key: ${storageKey}`);
    const blob = new Blob([data]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

export class LocalStorage<K extends string, D> {
  private readonly isBrowser =
    typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  private readonly storageRef: Storage;
  private onStorageChange: ((event: StorageEvent) => void) | null = null;
  export: (args?: { filename?: string; ext?: string }) => void;
  constructor(
    private readonly _key: K,
    private readonly _emitter: LocalStorageEmitter<D | null> = new Emitter(),
    storageRef?: Storage,
    exportFn?: (args?: { filename?: string; ext?: string }) => void
  ) {
    if (!this.isBrowser) {
      if (!storageRef)
        throw new Error(
          'No storageRef provided and LocalStorage is not available in the current environment'
        );
      else this.storageRef = storageRef;
      if (!exportFn)
        throw new Error(
          'No export function provided for non-browser environment'
        );
      else this.export = exportFn;
    } else {
      this.storageRef = storageRef ?? localStorage;
      this.export =
        exportFn ?? defaultBrowserExportFn(this._key, this.storageRef);
      this.onStorageChange = (event: StorageEvent) => {
        if (event.key === this._key && event.newValue !== this._curr.serialized)
          this.set(event.newValue);
      };
      window.addEventListener('storage', this.onStorageChange);
    }

    this.updateCurr(this.storageRef.getItem(this._key));
  }
  private readonly unsubCbs = new Map<string, () => void>();
  private _curr: { serialized: string | null; deserialized: D | null } = {
    serialized: null,
    deserialized: null
  };
  private updateCurr(data: string | D | null) {
    if (data === null) {
      this._curr.serialized = null;
      this._curr.deserialized = null;
    } else if (typeof data === 'string') {
      this._curr.serialized = data;
      this._curr.deserialized = deserialize<D>(data);
    } else {
      this._curr.serialized = serialize(data);
      this._curr.deserialized = data;
    }
  }
  private set(data: string | D | null) {
    const prev = this._curr.serialized;
    this.updateCurr(data);
    if (this._curr.serialized === prev) return;
    this._emitter.emit('preSave', this._curr.deserialized);
    if (this._curr.serialized === null) this.storageRef.removeItem(this._key);
    else this.storageRef.setItem(this._key, this._curr.serialized);
    this._emitter.emit('postSave', this._curr.deserialized);
  }
  get key() {
    return this._key;
  }
  get current() {
    return this._curr.deserialized;
  }
  get isEmpty() {
    return this._curr.deserialized === null;
  }

  findSubscriberId(cb: string | LocalStorageSubscriber<D>): string | null {
    const predicate =
      typeof cb === 'string' ?
        (id: string) => id.includes(`${this._key}-${cb}`)
      : (id: string) => {
          const subscriber = this.unsubCbs.get(id);
          return subscriber && subscriber === cb;
        };
    return Array.from(this.unsubCbs.keys()).find(predicate) ?? null;
  }
  save(d: D) {
    this.set(d);
    return this;
  }
  reset() {
    this.set(null);
    return this;
  }
  async import(file: File) {
    const text = await file.text();
    if (text === '') throw new Error('Invalid data format');
    this.set(text);
    return this;
  }
  on(
    on: ChangeEvent,
    cb: LocalStorageSubscriber<D> | LocalStorageSubscriber<D>[]
  ) {
    (Array.isArray(cb) ? cb : [cb]).forEach((c) => {
      const { id, off } = this._emitter.on(on, c);
      this.unsubCbs.set(id, off);
    });
    return this;
  }
  off(id: string | string[]) {
    (Array.isArray(id) ? id : [id]).forEach((i) => {
      const unsub = this.unsubCbs.get(i);
      if (unsub) {
        unsub();
        this.unsubCbs.delete(i);
      }
    });
    return this;
  }
  destroy() {
    this.unsubCbs.forEach((unsub) => unsub());
    this.unsubCbs.clear();
    this._emitter.clear();
    this.storageRef.removeItem(this._key);
    this._curr = { serialized: null, deserialized: null };
    if (this.onStorageChange)
      window.removeEventListener('storage', this.onStorageChange);
  }
}
