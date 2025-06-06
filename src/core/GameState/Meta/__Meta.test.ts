import { describe, it, expect, beforeEach } from 'vitest';
import { Meta, type MetaState } from './Meta';

describe('Meta', () => {
  let meta: Meta;
  let initialState: MetaState;

  beforeEach(() => {
    initialState = {
      id: 'test-id',
      runNumber: 42,
      createdAt: new Date('0000-01-01T00:00:00Z').toISOString(),
      lastUpdated: new Date('0000-01-02T00:00:00Z').toISOString()
    };
    meta = new Meta({ ...initialState });
  });

  it('should initialize with provided state', () => {
    expect(meta.state).toEqual(initialState);
    expect(meta.id).toBe(initialState.id);
    expect(meta.createAt).toBe(initialState.createdAt);
    expect(meta.lastUpdated).toBe(initialState.lastUpdated);
    expect(meta.runNumber).toBe(initialState.runNumber);
  });

  it('should initialize with default state if no initial provided', () => {
    const m = new Meta();
    expect(typeof m.id).toBe('string');
    expect(m.id.length).toBeGreaterThan(0);
    expect(typeof m.runNumber).toBe('number');
    expect(m.runNumber).toBe(0);
    expect(typeof m.createAt).toBe('string');
    expect(typeof m.lastUpdated).toBe('string');
    expect(() => new Date(m.createAt)).not.toThrow();
    expect(() => new Date(m.lastUpdated)).not.toThrow();
  });

  it('should increment runNumber and update lastUpdated', () => {
    const oldLastUpdated = meta.lastUpdated;
    meta.incrementRunNumber();
    expect(meta.runNumber).toBe(initialState.runNumber + 1);
    expect(meta.lastUpdated).not.toBe(oldLastUpdated);
  });

  it('should reset to a new state', () => {
    const m = new Meta({ ...initialState });
    m.incrementRunNumber();
    m.reset();
    expect(m.runNumber).toBe(0);
    expect(m.id).not.toBe(initialState.id);
  });

  it('should import a new valid state', () => {
    const newState: MetaState = {
      id: 'imported-id',
      runNumber: 99,
      createdAt: new Date('2024-01-01T00:00:00Z').toISOString(),
      lastUpdated: new Date('2024-01-02T00:00:00Z').toISOString()
    };
    meta.import(newState);
    expect(meta.state).toEqual(newState);
    expect(meta.id).toBe('imported-id');
    expect(meta.runNumber).toBe(99);
  });

  describe('validation', () => {
    it('should throw on invalid id', () => {
      expect(() => new Meta({ ...initialState, id: '' })).toThrow();
    });

    it('should throw on invalid runNumber', () => {
      expect(() => new Meta({ ...initialState, runNumber: -1 })).toThrow();
    });

    it('should throw on invalid createdAt', () => {
      expect(
        () => new Meta({ ...initialState, createdAt: 'not-a-date' })
      ).toThrow();
    });

    it('should throw on invalid lastUpdated', () => {
      expect(
        () => new Meta({ ...initialState, lastUpdated: 'not-a-date' })
      ).toThrow();
    });
  });

  it('should update lastUpdated on update', () => {
    const oldLastUpdated = meta.lastUpdated;
    // @ts-expect-error: testing private method
    meta.update({ runNumber: 123 });
    expect(meta.runNumber).toBe(123);
    expect(meta.lastUpdated).not.toBe(oldLastUpdated);
  });
});
