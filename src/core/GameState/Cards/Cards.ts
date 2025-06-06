import { Base } from '../Base';
import type { PokeApi } from '../../PokeApi';

/**
 * State shape for the Cards game logic.
 * - activeSet: The current set of Pokémon cards in play.
 * - clicked: Set of IDs representing cards that have been clicked.
 */
export interface CardsState {
  activeSet: PokeApi.PokemonData[];
  clicked: Set<number>;
}

/**
 * Cards class manages the state and logic for a set of Pokémon cards,
 * including shuffling, tracking clicked cards, and fetching new sets.
 */
export class Cards extends Base<CardsState> {
  /**
   * Constructs a new Cards instance.
   * @param fetchMethod - Async function to fetch a new set of Pokémon cards.
   * @param initial - Optional initial state.
   */
  constructor(
    private readonly fetchMethod: (
      count: number
    ) => Promise<PokeApi.PokemonData[]>,
    initial?: CardsState
  ) {
    super(
      (): CardsState => ({ activeSet: [], clicked: new Set<number>() }),
      (state: CardsState) => {
        if (!Array.isArray(state.activeSet))
          throw new Error('Invalid activeSet: must be an array');
        if (!(state.clicked instanceof Set))
          throw new Error('Invalid clicked: must be a Set');
        state.activeSet.forEach((card) => {
          if (typeof card.id !== 'number' || card.id < 0)
            throw new Error(`Invalid card ID: ${card.id}`);
          if (typeof card.name !== 'string' || card.name.length === 0)
            throw new Error(`Invalid card name: ${card.name}`);
        });
        if (state.clicked.size < 0)
          throw new Error('Invalid clicked: size must be non-negative');
        state.clicked.forEach((id) => {
          if (typeof id !== 'number' || id < 0)
            throw new Error(`Invalid clicked ID: ${id}`);
        });
      },
      initial
    );
  }
  /** Returns a deep clone of the current active set of cards. */
  get activeSet() {
    return structuredClone(this.state.activeSet);
  }
  /**
   * Sets a new active set and resets clicked cards.
   * @param activeSet - The new set of Pokémon cards.
   * @returns The Cards instance for chaining.
   */
  private setActiveSet(activeSet: PokeApi.PokemonData[]) {
    this.set({ activeSet, clicked: new Set<number>() });
    return this;
  }
  /**
   * Shuffles the current active set of cards using Fisher-Yates algorithm.
   * @returns The Cards instance for chaining.
   */
  shuffle() {
    const cards = [...this.state.activeSet];
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j]!, cards[i]!];
    }
    this.set({ ...this.state, activeSet: cards });
    return this;
  }
  /**
   * Fetches a new set of Pokémon cards and sets them as the active set.
   * @param count - Number of cards to fetch.
   * @returns The Cards instance for chaining.
   * @throws Error if fetching fails.
   */
  async fetchNewActiveSet(count: number) {
    try {
      this.setActiveSet(await this.fetchMethod(count));
    } catch (error) {
      throw error instanceof Error ? error : (
          new Error('An unexpected error occurred while fetching cards')
        );
    }
    return this;
  }
  /**
   * Adds a card ID to the set of clicked cards if it hasn't been clicked yet.
   * @param id - The card ID to add.
   * @returns The Cards instance for chaining.
   */
  addClicked(id: number) {
    if (!this.state.clicked.has(id))
      this.set({ ...this.state, clicked: new Set(this.state.clicked).add(id) });
    return this;
  }
  /**
   * Checks if a card ID has already been clicked.
   * @param id - The card ID to check.
   * @returns True if the card has been clicked, false otherwise.
   */
  hasClicked(id: number) {
    return this.state.clicked.has(id);
  }
  /**
   * Checks if all active cards have been clicked.
   * @returns True if all cards are clicked, false otherwise.
   */
  isAllActiveClicked() {
    return this.state.activeSet.length === this.state.clicked.size;
  }
}
