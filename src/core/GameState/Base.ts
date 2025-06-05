export abstract class Base<S> {
  private _state: S;
  constructor(
    protected getNewState: () => S,
    protected validate: (state: S) => void,
    initialState: S = getNewState()
  ) {
    this.validate(initialState);
    this._state = initialState;
  }
  get state() {
    return this._state;
  }
  protected set(newState: S): this {
    this._state = newState;
    return this;
  }
  reset(): this {
    this._state = this.getNewState();
    return this;
  }
  import(newState: S): this {
    this.validate(newState);
    this._state = structuredClone(newState);
    return this;
  }
}
