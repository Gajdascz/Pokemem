import { Base } from '../Base';

export interface PokedexEntry {
  id: number;
  name: string | null;
}
export interface PokedexState {
  found: number;
  entries: PokedexEntry[];
}
export class Pokedex extends Base<PokedexState> {
  constructor(
    public readonly maxId: number,
    initial?: PokedexState
  ) {
    super(
      (): PokedexState => ({
        entries: Array.from({ length: maxId }, (_, id) => ({ id, name: null })),
        found: 0
      }),
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

  get found() {
    return this.state.found;
  }
  get entries() {
    return this.state.entries.map((entry) => ({ ...entry }));
  }
  getEntry(id: number): PokedexEntry | null {
    const entry = this.state.entries[id];
    return entry ?? null;
  }
}
