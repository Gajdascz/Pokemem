import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Meta } from './Meta';

describe('Meta', () => {
  let meta: Meta;

  beforeEach(() => {
    // Mock crypto.randomUUID and Date for consistent testing
    vi.stubGlobal('crypto', { randomUUID: vi.fn(() => 'test-uuid-123') });

    const mockDate = new Date('0000-01-01T10:00:00.000Z');
    vi.setSystemTime(mockDate);

    meta = new Meta();
  });

  describe('constructor', () => {
    it('should initialize with default values when no initial state provided', () => {
      const newMeta = new Meta();
      expect(newMeta.id).toBe('test-uuid-123');
      expect(newMeta.runNumber).toBe(0);
      expect(newMeta.createAt).toBe('0000-01-01T10:00:00.000Z');
      expect(newMeta.lastUpdated).toBe('0000-01-01T10:00:00.000Z');
    });

    it('should initialize with provided state', () => {
      const initialState = {
        id: 'custom-id',
        runNumber: 5,
        createdAt: '2023-12-01T10:00:00.000Z',
        lastUpdated: '2023-12-15T10:00:00.000Z'
      };
      const newMeta = new Meta(initialState);
      expect(newMeta.id).toBe('custom-id');
      expect(newMeta.runNumber).toBe(5);
      expect(newMeta.createAt).toBe('2023-12-01T10:00:00.000Z');
      expect(newMeta.lastUpdated).toBe('2023-12-15T10:00:00.000Z');
    });

    it('should throw error when id is not a string', () => {
      const invalidState = {
        id: 123,
        runNumber: 0,
        createdAt: '0000-01-01T10:00:00.000Z',
        lastUpdated: '0000-01-01T10:00:00.000Z'
      };
      expect(() => new Meta(invalidState as any)).toThrow('Invalid Meta ID');
    });

    it('should throw error when id is empty string', () => {
      const invalidState = {
        id: '',
        runNumber: 0,
        createdAt: '0000-01-01T10:00:00.000Z',
        lastUpdated: '0000-01-01T10:00:00.000Z'
      };
      expect(() => new Meta(invalidState as any)).toThrow('Invalid Meta ID');
    });

    it('should throw error when runNumber is not a number', () => {
      const invalidState = {
        id: 'valid-id',
        runNumber: 'not-a-number',
        createdAt: '0000-01-01T10:00:00.000Z',
        lastUpdated: '0000-01-01T10:00:00.000Z'
      };
      expect(() => new Meta(invalidState as any)).toThrow('Invalid run number');
    });

    it('should throw error when runNumber is negative', () => {
      const invalidState = {
        id: 'valid-id',
        runNumber: -1,
        createdAt: '0000-01-01T10:00:00.000Z',
        lastUpdated: '0000-01-01T10:00:00.000Z'
      };
      expect(() => new Meta(invalidState as any)).toThrow('Invalid run number');
    });

    it('should throw error when createdAt is not a string', () => {
      const invalidState = {
        id: 'valid-id',
        runNumber: 0,
        createdAt: 123,
        lastUpdated: '0000-01-01T10:00:00.000Z'
      };
      expect(() => new Meta(invalidState as any)).toThrow(
        'Invalid createdAt date'
      );
    });

    it('should throw error when createdAt is invalid date string', () => {
      const invalidState = {
        id: 'valid-id',
        runNumber: 0,
        createdAt: 'invalid-date',
        lastUpdated: '0000-01-01T10:00:00.000Z'
      };
      expect(() => new Meta(invalidState as any)).toThrow(
        'Invalid createdAt date'
      );
    });

    it('should throw error when lastUpdated is not a string', () => {
      const invalidState = {
        id: 'valid-id',
        runNumber: 0,
        createdAt: '0000-01-01T10:00:00.000Z',
        lastUpdated: 123
      };
      expect(() => new Meta(invalidState as any)).toThrow(
        'Invalid lastUpdated date'
      );
    });

    it('should throw error when lastUpdated is invalid date string', () => {
      const invalidState = {
        id: 'valid-id',
        runNumber: 0,
        createdAt: '0000-01-01T10:00:00.000Z',
        lastUpdated: 'invalid-date'
      };
      expect(() => new Meta(invalidState as any)).toThrow(
        'Invalid lastUpdated date'
      );
    });
  });

  describe('getters', () => {
    it('should return correct id', () => {
      expect(meta.id).toBe('test-uuid-123');
    });

    it('should return correct createAt', () => {
      expect(meta.createAt).toBe('0000-01-01T10:00:00.000Z');
    });

    it('should return correct lastUpdated', () => {
      expect(meta.lastUpdated).toBe('0000-01-01T10:00:00.000Z');
    });

    it('should return correct runNumber', () => {
      expect(meta.runNumber).toBe(0);
    });
  });

  describe('update', () => {
    it('should update id and lastUpdated timestamp', () => {
      const newTime = new Date('2024-01-01T11:00:00.000Z');
      vi.setSystemTime(newTime);

      expect(meta.id).toBe('new-id');
      expect(meta.lastUpdated).toBe('2024-01-01T11:00:00.000Z');
      expect(meta.createAt).toBe('0000-01-01T10:00:00.000Z'); // Should not change
    });

    it('should update runNumber and lastUpdated timestamp', () => {
      const newTime = new Date('2024-01-01T12:00:00.000Z');
      vi.setSystemTime(newTime);

      expect(meta.runNumber).toBe(10);
      expect(meta.lastUpdated).toBe('2024-01-01T12:00:00.000Z');
    });

    it('should update multiple fields at once', () => {
      const newTime = new Date('2024-01-01T13:00:00.000Z');
      vi.setSystemTime(newTime);

      expect(meta.id).toBe('multi-update');
      expect(meta.runNumber).toBe(5);
      expect(meta.lastUpdated).toBe('2024-01-01T13:00:00.000Z');
    });

    it('should handle empty update object', () => {
      const originalLastUpdated = meta.lastUpdated;
      const newTime = new Date('2024-01-01T14:00:00.000Z');
      vi.setSystemTime(newTime);

      expect(meta.lastUpdated).toBe('2024-01-01T14:00:00.000Z');
      expect(meta.lastUpdated).not.toBe(originalLastUpdated);
    });

    it('should not allow updating createdAt or lastUpdated directly', () => {
      const newTime = new Date('2024-01-01T15:00:00.000Z');
      vi.setSystemTime(newTime);

      // TypeScript should prevent this, but test runtime behavior

      expect(meta.lastUpdated).toBe('2024-01-01T15:00:00.000Z');
      expect(meta.createAt).toBe('0000-01-01T10:00:00.000Z');
    });
  });

  describe('incrementRunNumber', () => {
    it('should increment runNumber by 1', () => {
      const result = meta.incrementRunNumber();

      expect(result).toBe(meta); // Returns this for chaining
      expect(meta.runNumber).toBe(1);
    });

    it('should increment runNumber multiple times', () => {
      meta.incrementRunNumber();
      meta.incrementRunNumber();
      meta.incrementRunNumber();

      expect(meta.runNumber).toBe(3);
    });

    it('should update lastUpdated when incrementing', () => {
      const originalLastUpdated = meta.lastUpdated;
      const newTime = new Date('2024-01-01T16:00:00.000Z');
      vi.setSystemTime(newTime);

      meta.incrementRunNumber();

      expect(meta.lastUpdated).toBe('2024-01-01T16:00:00.000Z');
      expect(meta.lastUpdated).not.toBe(originalLastUpdated);
    });

    it('should work with existing runNumber', () => {
      const initialState = {
        id: 'test-id',
        runNumber: 10,
        createdAt: '0000-01-01T10:00:00.000Z',
        lastUpdated: '0000-01-01T10:00:00.000Z'
      };
      const metaWithInitial = new Meta(initialState);

      metaWithInitial.incrementRunNumber();

      expect(metaWithInitial.runNumber).toBe(11);
    });
  });

  describe('method chaining', () => {
    it('should allow chaining update and incrementRunNumber', () => {
      const newTime = new Date('2024-01-01T17:00:00.000Z');
      vi.setSystemTime(newTime);

      expect(meta.id).toBe('chained-id');
      expect(meta.runNumber).toBe(1);
      expect(meta.lastUpdated).toBe('2024-01-01T17:00:00.000Z');
    });

    it('should allow multiple incrementRunNumber calls in chain', () => {
      const result = meta
        .incrementRunNumber()
        .incrementRunNumber()
        .incrementRunNumber();

      expect(result).toBe(meta);
      expect(meta.runNumber).toBe(3);
    });
  });

  describe('edge cases', () => {
    it('should handle very large runNumber', () => {
      meta.incrementRunNumber();

      expect(meta.runNumber).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('should handle runNumber of 0', () => {
      meta.incrementRunNumber();

      expect(meta.runNumber).toBe(1);
    });

    it('should preserve other fields when updating specific field', () => {
      const originalId = meta.id;
      const originalCreatedAt = meta.createAt;

      expect(meta.id).toBe(originalId);
      expect(meta.createAt).toBe(originalCreatedAt);
      expect(meta.runNumber).toBe(42);
    });
  });
});
