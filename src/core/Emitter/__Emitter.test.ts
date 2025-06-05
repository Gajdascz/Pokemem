import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Emitter } from './Emitter';

describe('Emitter', () => {
  let manager: Emitter<{ preSave: string | null; postSave: string | null }>;
  const key = 'preSave';

  beforeEach(() => {
    manager = new Emitter();
  });

  it('starts with no keys or listeners', () => {
    expect(manager.hasEvent(key)).toBe(false);
    expect(manager.getEventSubscriberCount(key)).toBe(0);
    expect(manager.getTotalSubscriberCount()).toBe(0);
    expect(manager.events).toEqual([]);
  });

  it('can subscribe and trigger listener', () => {
    const listener = vi.fn();
    manager.on(key, listener);

    expect(manager.hasEvent(key)).toBe(true);
    expect(manager.hasEventSubscriber(key, listener)).toBe(true);
    expect(manager.getEventSubscriberCount(key)).toBe(1);
    expect(manager.getTotalSubscriberCount()).toBe(1);
    expect(manager.events).toEqual([key]);

    manager.emit(key, 'value');
    expect(listener).toHaveBeenCalledWith('value');
  });

  it('can unsubscribe manually', () => {
    const listener = vi.fn();
    manager.on(key, listener);
    manager.off(key, listener);
    expect(manager.hasEventSubscriber(key, listener)).toBe(false);

    manager.emit(key, 'value');
    expect(listener).not.toHaveBeenCalled();
  });

  it('returns an unsub object with id and can unsubscribe via unsub()', () => {
    const namedListener = function onChange(val: any) {};
    const sub = manager.on(key, namedListener);

    expect(sub.id.startsWith('preSave-onChange')).toBe(true);

    expect(manager.hasEventSubscriber(key, namedListener)).toBe(true);
    sub.off();
    expect(manager.hasEventSubscriber(key, namedListener)).toBe(false);
  });

  it('handles anonymous function listener and generates id', () => {
    const anon = () => {};
    const sub = manager.on(key, anon);

    expect(sub.id.startsWith('preSave-')).toBe(true); // Should have UUID fallback
    expect(manager.hasEventSubscriber(key, anon)).toBe(true);

    sub.off();
    expect(manager.hasEventSubscriber(key, anon)).toBe(false);
  });

  it('publishes null and multiple calls', () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn();
    manager.on(key, listener1);
    manager.on(key, listener2);

    manager.emit(key, null);
    expect(listener1).toHaveBeenCalledWith(null);
    expect(listener2).toHaveBeenCalledWith(null);
  });

  it('does nothing if publishing to a key with no listeners', () => {
    expect(() => manager.emit('postSave', 'noListeners')).not.toThrow();
  });

  it('can remove a key entirely', () => {
    const listener = vi.fn();
    manager.on(key, listener);

    manager.removeEvent(key);
    expect(manager.hasEvent(key)).toBe(false);
    expect(manager.getEventSubscriberCount(key)).toBe(0);
    expect(manager.getTotalSubscriberCount()).toBe(0);
  });

  it('clear() removes all listeners and keys', () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn();
    manager.on('preSave', listener1);
    manager.on('postSave', listener2);

    manager.clear();

    expect(manager.getTotalSubscriberCount()).toBe(0);
    expect(manager.events).toEqual([]);
    expect(manager.hasEventSubscriber('preSave', listener1)).toBe(false);
    expect(manager.hasEventSubscriber('postSave', listener2)).toBe(false);
  });
});
