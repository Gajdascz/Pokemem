import type { PokemonData } from '../../../types';
import { Base } from '../Base';

export interface CardsState {
  activeSet: PokemonData[];
  clicked: Set<number>;
}

export class Cards extends Base<CardsState> {
  constructor(
    private readonly fetchMethod: (count: number) => Promise<PokemonData[]>,
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
  get activeSet() {
    return structuredClone(this.state.activeSet);
  }
  private setActiveSet(activeSet: PokemonData[]) {
    this.set({ activeSet, clicked: new Set<number>() });
    return this;
  }
  shuffle() {
    const cards = [...this.state.activeSet];
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j]!, cards[i]!];
    }
    this.set({ ...this.state, activeSet: cards });
    return this;
  }
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
  addClicked(id: number) {
    if (!this.state.clicked.has(id))
      this.set({ ...this.state, clicked: new Set(this.state.clicked).add(id) });
    return this;
  }
  hasClicked(id: number) {
    return this.state.clicked.has(id);
  }
  isAllActiveClicked() {
    return this.state.activeSet.length === this.state.clicked.size;
  }
}
