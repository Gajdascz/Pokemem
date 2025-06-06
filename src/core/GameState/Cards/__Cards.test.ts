import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Cards, type CardsState } from './Cards';
import type { PokeApi } from '../../PokeApi';

const mockFetch = async (count: number): Promise<PokeApi.PokemonData[]> => {
  const pokemonData = [];
  for (let i = 1; i <= count; i++) {
    pokemonData.push({
      id: i,
      name: `pokemon-${i}`,
      type: 'type',
      img: `https://example.com/pokemon-${i}.png`
    });
  }
  return pokemonData;
};

describe('Cards', () => {
  let cards: Cards;
  let initialState: CardsState;

  beforeEach(() => {
    initialState = {
      activeSet: [
        { id: 1, name: 'pokemon-1', type: 'type', img: 'img1.png' },
        { id: 2, name: 'pokemon-2', type: 'type', img: 'img2.png' }
      ],
      clicked: new Set([1])
    };
    cards = new Cards(mockFetch, initialState);
  });

  it('should initialize with provided state', () => {
    expect(cards.activeSet).toEqual(initialState.activeSet);
    expect(cards.hasClicked(1)).toBe(true);
    expect(cards.hasClicked(2)).toBe(false);
  });

  it('should initialize with default state if no initial provided', () => {
    const c = new Cards(mockFetch);
    expect(c.activeSet).toEqual([]);
    expect(c.isAllActiveClicked()).toBe(true);
  });

  it('should throw if activeSet is not an array', () => {
    expect(
      () =>
        new Cards(mockFetch, {
          activeSet: 'not an array' as any,
          clicked: new Set()
        })
    ).toThrow('Invalid activeSet: must be an array');
  });

  it('should throw if clicked is not a Set', () => {
    expect(
      () => new Cards(mockFetch, { activeSet: [], clicked: 'not a set' as any })
    ).toThrow('Invalid clicked: must be a Set');
  });

  it('should throw if activeSet contains invalid card ID', () => {
    expect(
      () =>
        new Cards(mockFetch, {
          activeSet: [
            { id: -1, name: 'invalid', type: 'type', img: 'img.png' }
          ],
          clicked: new Set()
        })
    ).toThrow('Invalid card ID: -1');
  });

  it('should throw if activeSet contains invalid card name', () => {
    expect(
      () =>
        new Cards(mockFetch, {
          activeSet: [{ id: 1, name: '', type: 'type', img: 'img.png' }],
          clicked: new Set()
        })
    ).toThrow('Invalid card name: ');
  });

  it('should throw if clicked contains invalid ID', () => {
    expect(
      () => new Cards(mockFetch, { activeSet: [], clicked: new Set([-1]) })
    ).toThrow('Invalid clicked ID: -1');
  });

  it('should add and check clicked IDs', () => {
    cards.addClicked(2);
    expect(cards.hasClicked(2)).toBe(true);
    // Should not add duplicate
    cards.addClicked(2);
    expect(cards.state.clicked.size).toBe(2);
  });

  it('should shuffle activeSet', () => {
    const before = cards.activeSet.map((c) => c.id);
    cards.shuffle();
    const after = cards.activeSet.map((c) => c.id);
    expect(after.sort()).toEqual(before.sort());
  });

  it('should fetch new active set and reset clicked', async () => {
    await cards.fetchNewActiveSet(3);
    expect(cards.activeSet).toHaveLength(3);
    expect(cards.state.clicked.size).toBe(0);
  });

  it('should handle fetch errors', async () => {
    const errorFetch = async () => {
      throw new Error('fail');
    };
    const c = new Cards(errorFetch);
    await expect(c.fetchNewActiveSet(2)).rejects.toThrow('fail');
  });

  it('should handle non-Error fetch errors', async () => {
    const errorFetch = async () => {
      throw 'fail';
    };
    const c = new Cards(errorFetch);
    await expect(c.fetchNewActiveSet(2)).rejects.toThrow(
      'An unexpected error occurred while fetching cards'
    );
  });

  it('isAllActiveClicked returns true if all active cards are clicked', async () => {
    await cards.fetchNewActiveSet(2);
    const ids = cards.activeSet.map((c) => c.id);
    ids.forEach((id) => cards.addClicked(id));
    expect(cards.isAllActiveClicked()).toBe(true);
  });

  it('isAllActiveClicked returns false if not all active cards are clicked', async () => {
    await cards.fetchNewActiveSet(2);
    const ids = cards.activeSet.map((c) => c.id);
    cards.addClicked(ids[0]!);
    expect(cards.isAllActiveClicked()).toBe(false);
  });

  it('activeSet getter returns a clone', async () => {
    await cards.fetchNewActiveSet(2);
    const set1 = cards.activeSet;
    const set2 = cards.activeSet;
    expect(set1).not.toBe(set2);
    set1.push({ id: 999, name: 'test', type: 'type', img: 'img.png' });
    expect(cards.activeSet.length).toBe(2);
  });
});
