import { describe, it, expect, beforeEach } from 'vitest';
import { Pokedex } from './Pokedex';

describe('Pokedex', () => {
  let pokedex: Pokedex;
  const maxId = 10;

  beforeEach(() => {
    pokedex = new Pokedex(maxId);
  });

  describe('constructor', () => {
    it('should initialize with default values when no initial state provided', () => {
      const newPokedex = new Pokedex(5);
      expect(newPokedex.found).toBe(0);
      expect(newPokedex.entries).toHaveLength(5);
      expect(newPokedex.entries.every((entry) => entry.name === null)).toBe(
        true
      );
      expect(newPokedex.entries.map((entry) => entry.id)).toEqual([
        0, 1, 2, 3, 4
      ]);
    });

    it('should initialize with provided state', () => {
      const initialState = {
        found: 2,
        entries: [
          { id: 0, name: 'Bulbasaur' },
          { id: 1, name: null },
          { id: 2, name: 'Venusaur' }
        ]
      };
      const newPokedex = new Pokedex(3, initialState);
      expect(newPokedex.found).toBe(2);
      expect(newPokedex.entries).toEqual(initialState.entries);
    });

    it('should throw error when found count is negative', () => {
      const invalidState = { found: -1, entries: [{ id: 0, name: null }] };
      expect(() => new Pokedex(1, invalidState)).toThrowError();
    });

    it('should throw error when found count exceeds maxId', () => {
      const invalidState = { found: 5, entries: [{ id: 0, name: null }] };
      expect(() => new Pokedex(1, invalidState)).toThrowError();
    });

    it('should throw error when entries length does not match maxId', () => {
      const invalidState = {
        found: 0,
        entries: [
          { id: 0, name: null },
          { id: 1, name: null }
        ]
      };
      expect(() => new Pokedex(3, invalidState)).toThrow(
        'Invalid entries length: 2. Expected 3.'
      );
    });

    it('should throw error when entry id is negative', () => {
      const invalidState = { found: 0, entries: [{ id: -1, name: null }] };
      expect(() => new Pokedex(1, invalidState)).toThrow(
        'Invalid Pokémon ID: -1. Must be between 0 and 0.'
      );
    });

    it('should throw error when entry id exceeds maxId', () => {
      const invalidState = { found: 0, entries: [{ id: 5, name: null }] };
      expect(() => new Pokedex(1, invalidState)).toThrow(
        'Invalid Pokémon ID: 5. Must be between 0 and 0.'
      );
    });

    it('should throw error when entry name is not string or null', () => {
      const invalidState = { found: 0, entries: [{ id: 0, name: 123 }] };
      expect(() => new Pokedex(1, invalidState as any)).toThrow(
        'Invalid Pokémon name: 123. Must be a string or null.'
      );
    });

    it('should accept valid string names', () => {
      const validState = { found: 1, entries: [{ id: 0, name: 'Pikachu' }] };
      const newPokedex = new Pokedex(1, validState);
      expect(newPokedex.entries[0]!.name).toBe('Pikachu');
    });

    it('should accept null names', () => {
      const validState = { found: 0, entries: [{ id: 0, name: null }] };
      const newPokedex = new Pokedex(1, validState);
      expect(newPokedex.entries[0]!.name).toBe(null);
    });
  });

  describe('addEntry', () => {
    it('should add new entry and increment found count', () => {
      const result = pokedex.addEntry({ id: 0, name: 'Bulbasaur' });

      expect(result).toBe(pokedex); // Returns this for chaining
      expect(pokedex.found).toBe(1);
      expect(pokedex.getEntry(0)?.name).toBe('Bulbasaur');
    });

    it('should add multiple entries', () => {
      pokedex.addEntry({ id: 0, name: 'Bulbasaur' });
      pokedex.addEntry({ id: 1, name: 'Ivysaur' });
      pokedex.addEntry({ id: 2, name: 'Venusaur' });

      expect(pokedex.found).toBe(3);
      expect(pokedex.getEntry(0)?.name).toBe('Bulbasaur');
      expect(pokedex.getEntry(1)?.name).toBe('Ivysaur');
      expect(pokedex.getEntry(2)?.name).toBe('Venusaur');
    });

    it('should throw error when id is negative', () => {
      expect(() => pokedex.addEntry({ id: -1, name: 'Invalid' })).toThrow(
        'Invalid Pokémon ID: -1'
      );
    });

    it('should throw error when id exceeds entries length', () => {
      expect(() => pokedex.addEntry({ id: maxId, name: 'Invalid' })).toThrow(
        `Invalid Pokémon ID: ${maxId}`
      );
    });

    it('should return this when adding same name to existing entry', () => {
      pokedex.addEntry({ id: 0, name: 'Bulbasaur' });
      const originalFound = pokedex.found;

      const result = pokedex.addEntry({ id: 0, name: 'Bulbasaur' });

      expect(result).toBe(pokedex);
      expect(pokedex.found).toBe(originalFound); // Should not increment
      expect(pokedex.getEntry(0)?.name).toBe('Bulbasaur');
    });

    it('should throw error when trying to add different name to existing entry', () => {
      pokedex.addEntry({ id: 0, name: 'Bulbasaur' });

      expect(() => pokedex.addEntry({ id: 0, name: 'Different Name' })).toThrow(
        'Conflict: "Bulbasaur" !== "Different Name"'
      );
    });

    it('should preserve existing entries when adding new ones', () => {
      pokedex.addEntry({ id: 0, name: 'Bulbasaur' });
      pokedex.addEntry({ id: 2, name: 'Venusaur' });

      expect(pokedex.getEntry(0)?.name).toBe('Bulbasaur');
      expect(pokedex.getEntry(1)?.name).toBe(null);
      expect(pokedex.getEntry(2)?.name).toBe('Venusaur');
    });
  });

  describe('found getter', () => {
    it('should return initial found count of 0', () => {
      expect(pokedex.found).toBe(0);
    });

    it('should return updated found count after adding entries', () => {
      pokedex.addEntry({ id: 0, name: 'Bulbasaur' });
      expect(pokedex.found).toBe(1);

      pokedex.addEntry({ id: 1, name: 'Ivysaur' });
      expect(pokedex.found).toBe(2);
    });

    it('should not increment when adding duplicate entry', () => {
      pokedex.addEntry({ id: 0, name: 'Bulbasaur' });
      pokedex.addEntry({ id: 0, name: 'Bulbasaur' });
      expect(pokedex.found).toBe(1);
    });
  });

  describe('entries getter', () => {
    it('should return cloned array of entries', () => {
      const entries1 = pokedex.entries;
      const entries2 = pokedex.entries;

      expect(entries1).toEqual(entries2);
      expect(entries1).not.toBe(entries2); // Different references

      // Each entry should also be cloned
      expect(entries1[0]).not.toBe(entries2[0]);
    });

    it('should return all entries with correct structure', () => {
      const entries = pokedex.entries;

      expect(entries).toHaveLength(maxId);
      entries.forEach((entry, index) => {
        expect(entry.id).toBe(index);
        expect(entry.name).toBe(null);
      });
    });

    it('should reflect changes after adding entries', () => {
      pokedex.addEntry({ id: 0, name: 'Bulbasaur' });
      pokedex.addEntry({ id: 2, name: 'Venusaur' });

      const entries = pokedex.entries;
      expect(entries[0]!.name).toBe('Bulbasaur');
      expect(entries[1]!.name).toBe(null);
      expect(entries[2]!.name).toBe('Venusaur');
    });

    it('should not allow mutation of internal state through returned array', () => {
      const entries = pokedex.entries;
      entries[0]!.name = 'Hacked';

      expect(pokedex.getEntry(0)?.name).toBe(null);
    });
  });

  describe('getEntry', () => {
    it('should return null for non-existent entries', () => {
      expect(pokedex.getEntry(0)).toEqual({ id: 0, name: null });
    });

    it('should return correct entry after adding', () => {
      pokedex.addEntry({ id: 5, name: 'Charizard' });

      const entry = pokedex.getEntry(5);
      expect(entry).toEqual({ id: 5, name: 'Charizard' });
    });

    it('should return null for out of bounds id', () => {
      expect(pokedex.getEntry(maxId)).toBe(null);
      expect(pokedex.getEntry(-1)).toBe(null);
    });

    it('should return null for very large id', () => {
      expect(pokedex.getEntry(999)).toBe(null);
    });

    it('should return entry with null name', () => {
      const entry = pokedex.getEntry(3);
      expect(entry).toEqual({ id: 3, name: null });
    });
  });

  describe('method chaining', () => {
    it('should allow chaining addEntry calls', () => {
      const result = pokedex
        .addEntry({ id: 0, name: 'Bulbasaur' })
        .addEntry({ id: 1, name: 'Ivysaur' })
        .addEntry({ id: 2, name: 'Venusaur' });

      expect(result).toBe(pokedex);
      expect(pokedex.found).toBe(3);
      expect(pokedex.getEntry(0)?.name).toBe('Bulbasaur');
      expect(pokedex.getEntry(1)?.name).toBe('Ivysaur');
      expect(pokedex.getEntry(2)?.name).toBe('Venusaur');
    });
  });

  describe('edge cases', () => {
    it('should handle maxId of 1', () => {
      const smallPokedex = new Pokedex(1);
      expect(smallPokedex.entries).toHaveLength(1);
      expect(smallPokedex.getEntry(0)).toEqual({ id: 0, name: null });
    });

    it('should handle large maxId', () => {
      const largePokedex = new Pokedex(1000);
      expect(largePokedex.entries).toHaveLength(1000);
      expect(largePokedex.found).toBe(0);
    });

    it('should maintain state consistency with complex operations', () => {
      pokedex.addEntry({ id: 0, name: 'Bulbasaur' });
      pokedex.addEntry({ id: 5, name: 'Charizard' });
      pokedex.addEntry({ id: 0, name: 'Bulbasaur' }); // Duplicate

      expect(pokedex.found).toBe(2);
      expect(pokedex.entries[0]!.name).toBe('Bulbasaur');
      expect(pokedex.entries[1]!.name).toBe(null);
      expect(pokedex.entries[5]!.name).toBe('Charizard');
    });

    it('should handle empty string names', () => {
      pokedex.addEntry({ id: 0, name: '' });
      expect(pokedex.getEntry(0)?.name).toBe('');
      expect(pokedex.found).toBe(1);
    });
  });
});
