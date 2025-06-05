import { describe, it, expect, beforeEach } from 'vitest';
import { Cards } from './Cards';
import type { PokemonData } from '../../../../types';

const mockFetch = async (count: number): Promise<PokemonData[]> => {
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

const mockFetchError = async (count: number): Promise<PokemonData[]> => {
  throw new Error('Fetch failed');
};

describe('Cards', () => {
  let cards: Cards;

  beforeEach(() => {
    cards = new Cards(mockFetch);
  });

  describe('constructor', () => {
    it('should initialize with default values when no initial state provided', () => {
      const newCards = new Cards(mockFetch);
      expect(newCards.activeSet).toEqual([]);
    });

    it('should initialize with provided state', () => {
      const initialState = {
        activeSet: [
          { id: 1, name: 'pokemon-1', type: 'type', img: 'img1.png' },
          { id: 2, name: 'pokemon-2', type: 'type', img: 'img2.png' }
        ],
        clicked: new Set([1])
      };
      const newCards = new Cards(mockFetch, initialState);
      expect(newCards.activeSet).toEqual(initialState.activeSet);
      expect(newCards.hasClicked(1)).toBe(true);
    });

    it('should throw error when activeSet is not an array', () => {
      const invalidState = { activeSet: 'not an array', clicked: new Set() };
      expect(() => new Cards(mockFetch, invalidState as any)).toThrow(
        'Invalid activeSet: must be an array'
      );
    });

    it('should throw error when clicked is not a Set', () => {
      const invalidState = { activeSet: [], clicked: 'not a set' };
      expect(() => new Cards(mockFetch, invalidState as any)).toThrow(
        'Invalid clicked: must be a Set'
      );
    });

    it('should throw error when activeSet contains invalid card ID', () => {
      const invalidState = {
        activeSet: [{ id: -1, name: 'invalid', type: 'type', img: 'img.png' }],
        clicked: new Set()
      };
      expect(() => new Cards(mockFetch, invalidState as any)).toThrow(
        'Invalid card ID: -1'
      );
    });

    it('should throw error when activeSet contains invalid card name', () => {
      const invalidState = {
        activeSet: [{ id: 1, name: '', type: 'type', img: 'img.png' }],
        clicked: new Set()
      };
      expect(() => new Cards(mockFetch, invalidState as any)).toThrow(
        'Invalid card name: '
      );
    });

    it('should throw error when clicked contains invalid ID', () => {
      const invalidState = { activeSet: [], clicked: new Set([-1]) };
      expect(() => new Cards(mockFetch, invalidState as any)).toThrow(
        'Invalid clicked ID: -1'
      );
    });

    it('should throw error when activeSet contains non-number ID', () => {
      const invalidState = {
        activeSet: [
          { id: 'not-number', name: 'pokemon', type: 'type', img: 'img.png' }
        ],
        clicked: new Set()
      };
      expect(() => new Cards(mockFetch, invalidState as any)).toThrow(
        'Invalid card ID: not-number'
      );
    });

    it('should throw error when activeSet contains non-string name', () => {
      const invalidState = {
        activeSet: [{ id: 1, name: 123, type: 'type', img: 'img.png' }],
        clicked: new Set()
      };
      expect(() => new Cards(mockFetch, invalidState as any)).toThrow(
        'Invalid card name: 123'
      );
    });

    it('should throw error when clicked contains non-number', () => {
      const invalidState = { activeSet: [], clicked: new Set(['not-number']) };
      expect(() => new Cards(mockFetch, invalidState as any)).toThrow(
        'Invalid clicked ID: not-number'
      );
    });
  });

  describe('activeSet getter', () => {
    it('should return a cloned array', async () => {
      await cards.fetchNewActiveSet(3);
      const retrieved1 = cards.activeSet;
      const retrieved2 = cards.activeSet;

      expect(retrieved1).toEqual(retrieved2);
      expect(retrieved1).not.toBe(retrieved2); // Different references

      // Modifying retrieved should not affect internal state
      retrieved1.push({ id: 999, name: 'test', type: 'type', img: 'img.png' });
      expect(cards.activeSet).toHaveLength(3);
    });

    it('should return empty array initially', () => {
      expect(cards.activeSet).toEqual([]);
    });
  });

  describe('shuffle', () => {
    it('should preserve all elements after fetchNewActiveSet', async () => {
      await cards.fetchNewActiveSet(8);
      const original = [...cards.activeSet];

      cards.shuffle();
      const shuffled = cards.activeSet;

      expect(shuffled).toHaveLength(original.length);
      expect(shuffled.map((p) => p.id).sort()).toEqual(
        original.map((p) => p.id).sort()
      );
    });

    it('should handle empty array', () => {
      cards.shuffle();
      expect(cards.activeSet).toEqual([]);
    });

    it('should handle single element array', async () => {
      await cards.fetchNewActiveSet(1);
      const original = [...cards.activeSet];
      cards.shuffle();
      expect(cards.activeSet).toEqual(original);
    });

    it('should actually shuffle the array (statistical test)', async () => {
      await cards.fetchNewActiveSet(10);
      const original = cards.activeSet.map((p) => p.id);

      let timesShuffled = 0;
      const maxAttempts = 50;

      for (let i = 0; i < maxAttempts; i++) {
        cards.shuffle();
        const shuffled = cards.activeSet.map((p) => p.id);
        if (JSON.stringify(shuffled) !== JSON.stringify(original)) {
          timesShuffled++;
        }
      }

      expect(timesShuffled).toBeGreaterThan(maxAttempts * 0.7);
    });

    it('should return this for chaining', async () => {
      await cards.fetchNewActiveSet(3);
      const result = cards.shuffle();
      expect(result).toBe(cards);
    });
  });

  describe('fetchNewActiveSet', () => {
    it('should fetch new pokemon data and set activeSet', async () => {
      await cards.fetchNewActiveSet(5);
      expect(cards.activeSet).toHaveLength(5);
      expect(cards.activeSet.every((p) => typeof p.id === 'number')).toBe(true);
      expect(cards.activeSet.every((p) => typeof p.name === 'string')).toBe(
        true
      );
    });

    it('should handle different set sizes', async () => {
      await cards.fetchNewActiveSet(3);
      expect(cards.activeSet).toHaveLength(3);

      await cards.fetchNewActiveSet(10);
      expect(cards.activeSet).toHaveLength(10);
    });

    it('should clear clicked state when fetching new set', async () => {
      await cards.fetchNewActiveSet(3);
      cards.addClicked(1);
      cards.addClicked(2);

      await cards.fetchNewActiveSet(5);
      expect(cards.hasClicked(1)).toBe(false);
      expect(cards.hasClicked(2)).toBe(false);
    });

    it('should throw error when fetch fails', async () => {
      const cardsWithError = new Cards(mockFetchError);
      await expect(cardsWithError.fetchNewActiveSet(5)).rejects.toThrow(
        'Fetch failed'
      );
    });

    it('should throw generic error for non-Error objects', async () => {
      const mockFetchNonError = async () => {
        throw 'string error';
      };
      const cardsWithNonError = new Cards(mockFetchNonError);
      await expect(cardsWithNonError.fetchNewActiveSet(5)).rejects.toThrow(
        'An unexpected error occurred while fetching cards'
      );
    });

    it('should return this for chaining', async () => {
      const result = await cards.fetchNewActiveSet(3);
      expect(result).toBe(cards);
    });
  });

  describe('addClicked', () => {
    it('should add new ID to clicked set', () => {
      cards.addClicked(5);
      expect(cards.hasClicked(5)).toBe(true);
    });

    it('should not add duplicate IDs', () => {
      cards.addClicked(5);
      cards.addClicked(5);
      // Set should still only contain one instance
      expect(cards.hasClicked(5)).toBe(true);
    });

    it('should add multiple different IDs', () => {
      cards.addClicked(1);
      cards.addClicked(2);
      cards.addClicked(3);
      expect(cards.hasClicked(1)).toBe(true);
      expect(cards.hasClicked(2)).toBe(true);
      expect(cards.hasClicked(3)).toBe(true);
    });

    it('should return this for chaining', () => {
      const result = cards.addClicked(1);
      expect(result).toBe(cards);
    });
  });

  describe('hasClicked', () => {
    it('should return true for clicked IDs', () => {
      cards.addClicked(5);
      expect(cards.hasClicked(5)).toBe(true);
    });

    it('should return false for unclicked IDs', () => {
      expect(cards.hasClicked(5)).toBe(false);
    });

    it('should work with multiple IDs', () => {
      cards.addClicked(1);
      cards.addClicked(3);
      expect(cards.hasClicked(1)).toBe(true);
      expect(cards.hasClicked(2)).toBe(false);
      expect(cards.hasClicked(3)).toBe(true);
    });
  });

  describe('isAllActiveClicked', () => {
    it('should return true when all active cards are clicked', async () => {
      await cards.fetchNewActiveSet(3);
      const activeIds = cards.activeSet.map((p) => p.id);

      activeIds.forEach((id) => cards.addClicked(id));
      expect(cards.isAllActiveClicked()).toBe(true);
    });

    it('should return false when not all active cards are clicked', async () => {
      await cards.fetchNewActiveSet(3);
      const activeIds = cards.activeSet.map((p) => p.id);
      cards.addClicked(activeIds[0]!);
      cards.addClicked(activeIds[1]!);
      expect(cards.isAllActiveClicked()).toBe(false);
    });

    it('should return true for empty activeSet', () => {
      expect(cards.isAllActiveClicked()).toBe(true);
    });

    it('should return false when no cards are clicked', async () => {
      await cards.fetchNewActiveSet(3);
      expect(cards.isAllActiveClicked()).toBe(false);
    });

    it('should consider only length comparison', async () => {
      await cards.fetchNewActiveSet(2);
      cards.addClicked(999); // ID not in activeSet
      cards.addClicked(888); // Another ID not in activeSet
      expect(cards.isAllActiveClicked()).toBe(true); // 2 clicked, 2 active
    });
  });

  describe('edge cases and integration', () => {
    it('should maintain state consistency through multiple operations', async () => {
      await cards.fetchNewActiveSet(5);
      const activeIds = cards.activeSet.map((p) => p.id);

      cards.addClicked(activeIds[0]!);
      cards.addClicked(activeIds[2]!);
      cards.shuffle();

      expect(cards.activeSet).toHaveLength(5);
      expect(cards.hasClicked(activeIds[0]!)).toBe(true);
      expect(cards.hasClicked(activeIds[2]!)).toBe(true);
      expect(cards.hasClicked(activeIds[1]!)).toBe(false);
    });

    it('should handle method chaining', async () => {
      const result = await cards
        .fetchNewActiveSet(3)
        .then((c) => c.addClicked(1))
        .then((c) => c.shuffle());

      expect(result).toBe(cards);
      expect(cards.activeSet).toHaveLength(3);
      expect(cards.hasClicked(1)).toBe(true);
    });

    it('should work with initial state containing clicked IDs', () => {
      const initialState = {
        activeSet: [
          { id: 1, name: 'pokemon-1', type: 'type', img: 'img1.png' },
          { id: 2, name: 'pokemon-2', type: 'type', img: 'img2.png' }
        ],
        clicked: new Set([1, 2])
      };
      const cardsWithState = new Cards(mockFetch, initialState);

      expect(cardsWithState.isAllActiveClicked()).toBe(true);
      cardsWithState.shuffle();
      expect(cardsWithState.hasClicked(1)).toBe(true);
      expect(cardsWithState.hasClicked(2)).toBe(true);
    });
  });
});
