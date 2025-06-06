import { deserialize, serialize } from './serializer/index';
import { type Subscriber, Emitter } from '../Emitter/index';

/** Events emitted by LocalStorage: before and after saving data. */
export type ChangeEvent = 'preSave' | 'postSave';
/** Emitter type for LocalStorage, parameterized by data type. */
export type LocalStorageEmitter<D> = Emitter<{ [E in ChangeEvent]: D | null }>;
/** Subscriber type for LocalStorage, parameterized by data type. */
export type LocalStorageSubscriber<D> = Subscriber<D | null>;

/**
 * Default export function for browser environments.
 * Creates a downloadable file from the stored data.
 */
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

/**
 * LocalStorage class provides a wrapper
 * around browser/local storage
 * with serialization, deserialization, event emitting, and
 * import/export support.
 *
 * @template K - The key type for storage.
 * @template D - The data type to store.
 */
export class LocalStorage<K extends string, D> {
  /** True if running in a browser environment with localStorage available. */
  private readonly isBrowser =
    typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  /** Reference to the storage object (localStorage or custom). */
  private readonly storageRef: Storage;
  /** Handler for storage events (browser only). */
  private onStorageChange: ((event: StorageEvent) => void) | null = null;
  /** Export function for downloading stored data. */
  export: (args?: { filename?: string; ext?: string }) => void;

  /**
   * Constructs a LocalStorage instance.
   * @param _key - The storage key.
   * @param _emitter - Optional event emitter.
   * @param storageRef - Optional custom storage reference.
   * @param exportFn - Optional custom export function.
   */
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
  /** Map of subscriber IDs to their unsubscribe callbacks. */
  private readonly unsubCbs = new Map<string, () => void>();
  /** Current serialized and deserialized value. */
  private _curr: { serialized: string | null; deserialized: D | null } = {
    serialized: null,
    deserialized: null
  };
  /**
   * Updates the current value from serialized or
   * deserialized data.
   *
   * @param data - The data to update from.
   */
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
  /**
   * Sets the current value and updates storage.
   * Emits preSave and postSave events.
   * @param data - The new data to set.
   */
  private set(data: string | D | null) {
    const prev = this._curr.serialized;
    this.updateCurr(data);
    if (this._curr.serialized === prev) return;
    this._emitter.emit('preSave', this._curr.deserialized);
    if (this._curr.serialized === null) this.storageRef.removeItem(this._key);
    else this.storageRef.setItem(this._key, this._curr.serialized);
    this._emitter.emit('postSave', this._curr.deserialized);
  }
  /** Returns the storage key. */
  get key() {
    return this._key;
  }
  /** Returns the current deserialized value. */
  get current() {
    return this._curr.deserialized;
  }
  /** Returns true if storage is empty. */
  get isEmpty() {
    return this._curr.deserialized === null;
  }
  /**
   * Finds a subscriber ID by callback or string.
   * @param cb - The callback or string to search for.
   * @returns The subscriber ID or null.
   */
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
  /**
   * Saves new data to storage.
   * @param d - The data to save.
   * @returns The LocalStorage instance.
   */
  save(d: D) {
    this.set(d);
    return this;
  }
  /**
   * Clears the stored value.
   * @returns The LocalStorage instance.
   */
  reset() {
    this.set(null);
    return this;
  }
  /**
   * Imports data from a file and saves it to storage.
   * @param file - The file to import.
   * @returns The LocalStorage instance.
   */
  async import(file: File) {
    const text = await file.text();
    if (text === '') throw new Error('Invalid data format');
    this.set(text);
    return this;
  }
  /**
   * Subscribes to storage change events.
   * @param on - The event to listen for.
   * @param cb - The callback(s) to invoke.
   * @returns The LocalStorage instance.
   */
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
  /**
   * Unsubscribes from storage change events by ID(s).
   * @param id - The subscriber ID(s) to remove.
   * @returns The LocalStorage instance.
   */
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
  /** Removes all subscribers and clears storage. */
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
