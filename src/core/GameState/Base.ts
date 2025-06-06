/**
 * Abstract base class for managing stateful game objects.
 * Provides state initialization, validation, mutation, reset, and import functionality.
 *
 * @template S - The type of the state object.
 */
export abstract class Base<S> {
  /** Internal state storage. */
  private _state: S;

  /**
   * Constructs a new Base instance.
   * @param getNewState - Function that returns a new default state.
   * @param validate - Function to validate a state object.
   * @param initialState - Optional initial state (defaults to getNewState()).
   */
  constructor(
    protected getNewState: () => S,
    protected validate: (state: S) => void,
    initialState: S = getNewState()
  ) {
    this.validate(initialState);
    this._state = initialState;
  }

  /** Returns the current state. */
  get state() {
    return this._state;
  }

  /**
   * Sets the internal state to a new value.
   * @param newState - The new state to set.
   * @returns The instance for chaining.
   */
  protected set(newState: S): this {
    this._state = newState;
    return this;
  }

  /**
   * Resets the state to a new default state.
   * @returns The instance for chaining.
   */
  reset(): this {
    this._state = this.getNewState();
    return this;
  }

  /**
   * Imports and validates a new state, replacing the current state.
   * Uses structuredClone to avoid reference issues.
   * @param newState - The new state to import.
   * @returns The instance for chaining.
   */
  import(newState: S): this {
    this.validate(newState);
    this._state = structuredClone(newState);
    return this;
  }
}
