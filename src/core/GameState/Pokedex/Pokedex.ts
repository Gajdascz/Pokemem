import { Base } from '../Base';

/**
 * Represents a single Pokédex entry.
 * - id: The Pokémon's unique identifier.
 * - name: The Pokémon's name, or null if not yet discovered.
 */
export interface PokedexEntry {
  id: number;
  name: string | null;
}

/**
 * State shape for the Pokédex.
 * - found: Number of Pokémon discovered.
 * - entries: Array of Pokédex entries.
 */
export interface PokedexState {
  found: number;
  entries: PokedexEntry[];
}

/**
 * Pokedex class manages the state and logic for tracking discovered Pokémon.
 * Handles validation, adding entries, and querying the Pokédex.
 */
export class Pokedex extends Base<PokedexState> {
  /**
   * Constructs a new Pokedex instance.
   * @param maxId - The maximum number of Pokémon (size of the Pokédex).
   * @param initial - Optional initial Pokédex state.
   */
  constructor(
    public readonly maxId: number,
    initial?: PokedexState
  ) {
    super(
      // Returns a new default Pokédex state.
      (): PokedexState => ({
        entries: Array.from({ length: maxId }, (_, id) => ({ id, name: null })),
        found: 0
      }),
      // Validates the Pokédex state shape and values.
      (pokedex: PokedexState) => {
        if (pokedex.found < 0 || pokedex.found > maxId)
          throw new Error(
            `Invalid found count: ${pokedex.found}. Must be between 0 and ${maxId}.`
          );
        if (pokedex.entries.length !== maxId)
          throw new Error(
            `Invalid entries length: ${pokedex.entries.length}. Expected ${maxId}.`
          );
        let foundInEntries = 0;
        pokedex.entries.forEach((entry) => {
          if (entry.id < 0 || entry.id >= maxId)
            throw new Error(
              `Invalid Pokémon ID: ${entry.id}. Must be between 0 and ${maxId - 1}.`
            );
          if (typeof entry.name === 'string') foundInEntries += 1;
          else if (entry.name !== null)
            throw new Error(
              `Invalid Pokémon name: ${entry.name}. Must be a string or null.`
            );
        });

        if (foundInEntries !== pokedex.found) {
          throw new Error(
            `Found count mismatch: ${pokedex.found} vs ${foundInEntries}.`
          );
        }
      },
      initial
    );
  }

  /**
   * Adds a new entry to the Pokédex.
   * Throws if the entry already exists with a different name.
   * @param entry - The Pokédex entry to add.
   * @returns The Pokedex instance for chaining.
   */
  addEntry(entry: PokedexEntry) {
    const { id, name } = entry;
    if (id < 0 || id >= this.state.entries.length)
      throw new Error(`Invalid Pokémon ID: ${id}`);
    const existing = this.state.entries[id];
    if (existing === undefined)
      throw new Error(`No Pokémon found with ID: ${id}`);
    if (existing.name !== null) {
      if (existing.name === name) return this;
      throw new Error(`Conflict: "${existing.name}" !== "${name}"`);
    }
    const entries = [...this.state.entries];
    entries[id] = { id, name };
    this.set({ found: this.state.found + 1, entries });
    return this;
  }

  /** Returns the number of Pokémon found. */
  get found() {
    return this.state.found;
  }

  /** Returns a shallow copy of all Pokédex entries. */
  get entries() {
    return this.state.entries.map((entry) => ({ ...entry }));
  }

  /**
   * Returns a specific Pokédex entry by ID, or null if not found.
   * @param id - The Pokémon ID.
   * @returns The Pokédex entry or null.
   */
  getEntry(id: number): PokedexEntry | null {
    const entry = this.state.entries[id];
    return entry ?? null;
  }
}
