/**
 * A function that receives a value of type D.
 */
export type Subscriber<D> = (value: D) => void;

/**
 * Represents a subscription to an event.
 * - id: Unique identifier for the subscription.
 * - off: Function to unsubscribe from the event.
 */
export interface Subscription {
  id: string;
  off: () => void;
}

/**
 * Emitter class for managing event subscriptions and emitting events.
 * Supports multiple event types via a generic EventMap.
 *
 * @template EventMap - An object mapping event names to their payload types.
 */
export class Emitter<EventMap extends Record<string, unknown>> {
  /** Internal map of event names to sets of subscriber callbacks. */
  private _subscribers = new Map<keyof EventMap, Set<(value: any) => void>>();

  /**
   * Checks if there are any subscribers for a given event.
   * @param event - The event name.
   * @returns True if the event has subscribers, false otherwise.
   */
  hasEvent<E extends keyof EventMap>(event: E) {
    return this._subscribers.has(event);
  }

  /**
   * Checks if a specific subscriber is registered for an event.
   * @param event - The event name.
   * @param cb - The subscriber callback.
   * @returns True if the subscriber is registered, false otherwise.
   */
  hasEventSubscriber<E extends keyof EventMap>(
    event: E,
    cb: Subscriber<EventMap[E]>
  ) {
    return this._subscribers.get(event)?.has(cb) ?? false;
  }

  /** Returns an array of all event names with subscribers. */
  get events() {
    return Array.from(this._subscribers.keys());
  }

  /**
   * Gets the number of subscribers for a specific event.
   * @param event - The event name.
   * @returns The number of subscribers.
   */
  getEventSubscriberCount<E extends keyof EventMap>(event: E) {
    return this._subscribers.get(event)?.size ?? 0;
  }

  /** Gets the total number of subscribers across all events. */
  getTotalSubscriberCount() {
    return Array.from(this._subscribers.values()).reduce(
      (count, set) => count + set.size,
      0
    );
  }

  /**
   * Subscribes to an event.
   * @param event - The event name.
   * @param cb - The subscriber callback.
   * @returns A Subscription object for unsubscribing.
   */
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

  /**
   * Unsubscribes a callback from an event.
   * @param event - The event name.
   * @param cb - The subscriber callback to remove.
   */
  off<E extends keyof EventMap>(event: E, cb: Subscriber<EventMap[E]>) {
    this._subscribers.get(event)?.delete(cb);
  }

  /**
   * Emits an event to all its subscribers.
   * @param event - The event name.
   * @param value - The payload to send to subscribers.
   */
  emit<E extends keyof EventMap>(event: E, value: EventMap[E]) {
    this._subscribers.get(event)?.forEach((cb) => cb(value));
  }

  /**
   * Removes all subscribers for a specific event.
   * @param event - The event name.
   */
  removeEvent<E extends keyof EventMap>(event: E) {
    this._subscribers.delete(event);
  }

  /** Removes all subscribers for all events. */
  clear() {
    this._subscribers.forEach((set) => set.clear());
    this._subscribers.clear();
  }
}
