export type Subscriber<D> = (value: D) => void;
export interface Subscription {
  id: string;
  off: () => void;
}
export class Emitter<EventMap extends Record<string, unknown>> {
  private _subscribers = new Map<keyof EventMap, Set<(value: any) => void>>();
  hasEvent<E extends keyof EventMap>(event: E) {
    return this._subscribers.has(event);
  }
  hasEventSubscriber<E extends keyof EventMap>(
    event: E,
    cb: Subscriber<EventMap[E]>
  ) {
    return this._subscribers.get(event)?.has(cb) ?? false;
  }
  get events() {
    return Array.from(this._subscribers.keys());
  }
  getEventSubscriberCount<E extends keyof EventMap>(event: E) {
    return this._subscribers.get(event)?.size ?? 0;
  }
  getTotalSubscriberCount() {
    return Array.from(this._subscribers.values()).reduce(
      (count, set) => count + set.size,
      0
    );
  }
  on<E extends keyof EventMap>(
    event: E,
    cb: Subscriber<EventMap[E]>
  ): Subscription {
    if (!this.hasEvent(event)) this._subscribers.set(event, new Set());
    this._subscribers.get(event)!.add(cb);
    return {
      id: `${event as string}-${cb.name || crypto.randomUUID()}`,
      off: () => this._subscribers.get(event)!.delete(cb)
    };
  }
  off<E extends keyof EventMap>(event: E, cb: Subscriber<EventMap[E]>) {
    this._subscribers.get(event)?.delete(cb);
  }
  emit<E extends keyof EventMap>(event: E, value: EventMap[E]) {
    this._subscribers.get(event)?.forEach((cb) => cb(value));
  }
  removeEvent<E extends keyof EventMap>(event: E) {
    this._subscribers.delete(event);
  }
  clear() {
    this._subscribers.forEach((set) => set.clear());
    this._subscribers.clear();
  }
}
