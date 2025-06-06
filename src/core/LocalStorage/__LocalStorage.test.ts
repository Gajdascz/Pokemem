import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as serializer from './serializer/index';
import { LocalStorage } from './LocalStorage';

const mockEmitter = {
  on: vi.fn(() => ({ id: 'mock-id', off: vi.fn() })),
  off: vi.fn(),
  emit: vi.fn(),
  clear: vi.fn()
};

vi.mock('./serializer/index', () => ({
  serialize: vi.fn((data) => JSON.stringify(data)),
  deserialize: vi.fn((data) => JSON.parse(data))
}));

describe('LocalStorage', () => {
  const key = 'test-key';
  let storage: LocalStorage<typeof key, object>;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
    storage = new LocalStorage(key, mockEmitter as any);
  });

  afterEach(() => {
    storage.destroy();
    vi.unstubAllGlobals();
  });

  it('initializes with empty state', () => {
    expect(storage.key).toBe(key);
    expect(storage.current).toBe(null);
    expect(storage.isEmpty).toBe(true);
  });

  it('saves data and updates internal state', () => {
    const data = { foo: 'bar' };
    storage.save(data);

    expect(serializer.serialize).toHaveBeenCalledWith(data);
    expect(mockEmitter.emit).toHaveBeenCalledWith('preSave', data);
    expect(mockEmitter.emit).toHaveBeenCalledWith('postSave', data);
    expect(localStorage.getItem(key)).toBe(JSON.stringify(data));
  });

  it('resets data to null and clears storage', () => {
    storage.save({ x: 1 });
    storage.reset();

    expect(storage.current).toBe(null);
    expect(localStorage.getItem(key)).toBe(null);
  });

  it('handles external storage change and deserializes new data', () => {
    const newData = JSON.stringify({ updated: true });

    const listener = vi.fn();
    window.addEventListener = vi.fn((_, cb) => {
      listener.mockImplementation(cb);
    });

    storage = new LocalStorage(key);
    storage.save({ updated: false });

    listener({ key, newValue: newData });

    expect(serializer.deserialize).toHaveBeenCalledWith(newData);
    expect(storage.current).toEqual({ updated: true });
  });

  it('ignores unrelated storage events', () => {
    const spy = vi.spyOn(storage as any, 'set');
    const event = new StorageEvent('storage', {
      key: 'other-key',
      newValue: JSON.stringify({ x: 1 })
    });
    dispatchEvent(event);
    expect(spy).not.toHaveBeenCalled();
  });

  it('exports data as file download', () => {
    const data = { a: 1 };
    storage.save(data);

    const a = document.createElement('a');
    const clickSpy = vi.spyOn(a, 'click').mockImplementation(() => {});
    const appendChildSpy = vi.spyOn(document.body, 'appendChild');
    const removeChildSpy = vi.spyOn(document.body, 'removeChild');

    vi.spyOn(document, 'createElement').mockReturnValue(a);

    storage.export({ filename: 'backup', ext: 'txt' });

    expect(appendChildSpy).toHaveBeenCalledWith(a);
    expect(clickSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalledWith(a);
  });

  it('throws if exporting with no data', () => {
    expect(() => storage.export()).toThrowError();
  });

  it('imports file and sets data', async () => {
    const content = JSON.stringify({ z: 9 });
    const mockFile = {
      text: vi.fn().mockResolvedValue(content)
    } as unknown as File;

    await storage.import(mockFile);
    expect(serializer.deserialize).toHaveBeenCalledWith(content);
    expect(storage.current).toEqual({ z: 9 });
  });

  it('throws on empty import file', async () => {
    const emptyFile = new File([''], 'empty.json');
    await expect(storage.import(emptyFile)).rejects.toThrowError();
  });

  it('can subscribe to events', () => {
    const cb = vi.fn();
    storage.on('preSave', cb);

    expect(mockEmitter.on).toHaveBeenCalledWith('preSave', cb);
  });

  it('can unsubscribe using ID', () => {
    const off = vi.fn();
    (mockEmitter.on as any).mockReturnValue({ id: 'mock-id', off });

    storage.on('postSave', vi.fn());
    storage.off('mock-id');

    expect(off).toHaveBeenCalled();
  });

  it('can unsubscribe multiple IDs', () => {
    const off1 = vi.fn();
    const off2 = vi.fn();
    storage['unsubCbs'].set('id1', off1);
    storage['unsubCbs'].set('id2', off2);

    storage.off(['id1', 'id2']);

    expect(off1).toHaveBeenCalled();
    expect(off2).toHaveBeenCalled();
  });

  it('destroy cleans up mockEmitter and state', () => {
    const off = vi.fn();
    storage['unsubCbs'].set('id', off);

    storage.destroy();

    expect(off).toHaveBeenCalled();
    expect(mockEmitter.clear).toHaveBeenCalled();
    expect(localStorage.getItem(key)).toBeNull();
    expect(storage.current).toBe(null);
  });

  it('findSubscriberId returns correct id by string', () => {
    storage['unsubCbs'].set('test-key-abc', vi.fn());
    const id = storage.findSubscriberId('abc');
    expect(id).toBe('test-key-abc');
  });

  it('findSubscriberId returns correct id by function', () => {
    const fn = vi.fn();
    storage['unsubCbs'].set('test-key-fn', fn);
    const id = storage.findSubscriberId(fn);
    expect(id).toBe('test-key-fn');
  });

  it('findSubscriberId returns null if not found', () => {
    expect(storage.findSubscriberId('nonexistent')).toBe(null);
  });
});
