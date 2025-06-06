import { Base } from '../Base';

/**
 * State shape for meta information about a game run.
 * - id: Unique identifier for the run.
 * - runNumber: The current run number.
 * - createdAt: Timestamp when the run was created.
 * - lastUpdated: Timestamp of the last update.
 */
export interface MetaState {
  id: string;
  runNumber: number;
  createdAt: string | Date;
  lastUpdated: string | Date;
}

/**
 * Meta class manages metadata for a game run, such as unique ID,
 * run number, and timestamps for creation and last update.
 */
export class Meta extends Base<MetaState> {
  /**
   * Constructs a new Meta instance.
   * @param initial - Optional initial meta state.
   */
  constructor(initial?: MetaState) {
    super(
      // Returns a new default meta state.
      (): MetaState => ({
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        runNumber: 0
      }),
      // Validates the meta state shape and values.
      (meta: Partial<MetaState>) => {
        if (typeof meta.id !== 'string' || meta.id.length === 0)
          throw new Error('Invalid Meta ID');
        if (typeof meta.runNumber !== 'number' || meta.runNumber < 0)
          throw new Error('Invalid run number');
        if (
          !(
            (typeof meta.createdAt === 'string'
              && !isNaN(Date.parse(meta.createdAt)))
            || meta.createdAt instanceof Date
          )
        )
          throw new Error('Invalid createdAt date');
        if (
          !(
            (typeof meta.lastUpdated === 'string'
              && !isNaN(Date.parse(meta.lastUpdated)))
            || meta.lastUpdated instanceof Date
          )
        )
          throw new Error('Invalid lastUpdated date');
      },
      initial
    );
  }

  /**
   * Updates meta state with new values (except createdAt/lastUpdated),
   * and sets lastUpdated to the current time.
   * @param newMeta - Partial meta state to update.
   * @returns The Meta instance for chaining.
   */
  private update(
    newMeta: Omit<Partial<MetaState>, 'createdAt' | 'lastUpdated'>
  ) {
    this.set({
      ...this.state,
      ...newMeta,
      lastUpdated: new Date().toISOString()
    });
    return this;
  }

  /**
   * Increments the run number and updates lastUpdated.
   * @returns The Meta instance for chaining.
   */
  incrementRunNumber() {
    this.update({ runNumber: this.state.runNumber + 1 });
    return this;
  }

  /** Returns the unique ID for this meta state. */
  get id() {
    return this.state.id;
  }

  /** Returns the creation timestamp. */
  get createAt() {
    return this.state.createdAt;
  }

  /** Returns the last updated timestamp. */
  get lastUpdated() {
    return this.state.lastUpdated;
  }

  /** Returns the current run number. */
  get runNumber() {
    return this.state.runNumber;
  }
}
