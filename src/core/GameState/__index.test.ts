import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameState, type Session, type StateConstructorArgs } from './index';
import type { PokemonData } from '../../../types';

// Mock the dependent classes
vi.mock('./Meta/Meta', () => ({
  Meta: vi
    .fn()
    .mockImplementation((initialState) => ({
      runNumber: 1,
      get: vi
        .fn()
        .mockReturnValue({
          id: 'test-id',
          runNumber: 1,
          createdAt: '2025-01-01',
          lastUpdated: '2025-01-01'
        }),
      import: vi.fn()
    }))
}));

vi.mock('./Settings/Settings', () => ({
  Settings: vi
    .fn()
    .mockImplementation((initialState) => ({
      get: vi.fn().mockReturnValue({ bgMusic: true }),
      import: vi.fn()
    }))
}));

vi.mock('./Pokedex/Pokedex', () => ({
  Pokedex: vi
    .fn()
    .mockImplementation((maxId, initialState) => ({
      get: vi.fn().mockReturnValue({ found: 0, entries: [] }),
      import: vi.fn()
    }))
}));

vi.mock('./Score/Score', () => ({
  Score: vi
    .fn()
    .mockImplementation((initialState) => ({
      get: vi
        .fn()
        .mockReturnValue({
          running: { round: 1, score: 0 },
          highest: { round: 1, score: 0 }
        }),
      import: vi.fn()
    }))
}));

vi.mock('./Cards/Cards', () => ({
  Cards: vi
    .fn()
    .mockImplementation((fetchFn, initialState) => ({
      get: vi.fn().mockReturnValue({ activeSet: [], clicked: new Set() }),
      import: vi.fn()
    }))
}));

describe('GameState', () => {
  let mockFetchPokemonData: ReturnType<typeof vi.fn>;
  let mockPokemonData: PokemonData[];
  let constructorArgs: StateConstructorArgs;

  beforeEach(() => {
    vi.clearAllMocks();

    mockPokemonData = [
      { id: 1, name: 'pikachu', type: 'electric', img: 'pikachu.png' },
      { id: 2, name: 'charizard', type: 'fire', img: 'charizard.png' }
    ];

    mockFetchPokemonData = vi.fn().mockResolvedValue(mockPokemonData);

    constructorArgs = {
      fetchPokemonData: mockFetchPokemonData,
      maxPokemonId: 1025,
      baseCardCount: 2
    };
  });

  describe('constructor', () => {
    it('should create GameState with default values when no initial session provided', () => {
      const state = new GameState(constructorArgs);

      expect(state.maxPokemonId).toBe(1025);
      expect(state.baseCardCount).toBe(2);
    });

    it('should create GameState with custom baseCardCount', () => {
      const customArgs = { ...constructorArgs, baseCardCount: 4 };
      const state = new GameState(customArgs);

      expect(state.baseCardCount).toBe(4);
    });

    it('should create GameState with default baseCardCount when not provided', () => {
      const { baseCardCount, ...argsWithoutBase } = constructorArgs;
      const state = new GameState(argsWithoutBase);

      expect(state.baseCardCount).toBe(2);
    });

    it('should create GameState with initial session data', () => {
      const mockSession: Session = {
        meta: {
          id: 'test-id',
          runNumber: 5,
          createdAt: '2025-01-01',
          lastUpdated: '2025-01-01'
        },
        settings: { bgMusic: false },
        pokedex: { found: 10, entries: [{ id: 1, name: 'pikachu' }] },
        scores: {
          running: { round: 3, score: 100 },
          highest: { round: 5, score: 150 }
        },
        cards: { activeSet: [mockPokemonData[0]!], clicked: new Set([1, 2]) }
      };

      const argsWithSession = {
        ...constructorArgs,
        initialSession: mockSession
      };
      const state = new GameState(argsWithSession);

      expect(state.maxPokemonId).toBe(1025);
      expect(state.baseCardCount).toBe(2);
    });

    it('should handle null initial session', () => {
      const argsWithNullSession = { ...constructorArgs, initialSession: null };
      const state = new GameState(argsWithNullSession);

      expect(state.maxPokemonId).toBe(1025);
      expect(state.baseCardCount).toBe(2);
    });
  });

  describe('getters', () => {
    let state: GameState;

    beforeEach(() => {
      state = new GameState(constructorArgs);
    });

    it('should return correct nextCardCount based on runNumber', () => {
      // Mock Meta to return runNumber of 3
      vi.mocked(state.meta).runNumber = 3;

      expect(state.nextCardCount).toBe(8); // baseCardCount (2) + runNumber (3) * 2
    });

    it('should return nextCardCount with different runNumber', () => {
      vi.mocked(state.meta).runNumber = 0;

      expect(state.nextCardCount).toBe(2); // baseCardCount (2) + runNumber (0) * 2
    });

    it('should return meta instance', () => {
      expect(state.meta).toBeDefined();
    });

    it('should return settings instance', () => {
      expect(state.settings).toBeDefined();
    });

    it('should return pokedex instance', () => {
      expect(state.pokedex).toBeDefined();
    });

    it('should return scores instance', () => {
      expect(state.scores).toBeDefined();
    });

    it('should return cards instance', () => {
      expect(state.cards).toBeDefined();
    });

    it('should return complete session object', () => {
      const session = state.session;

      expect(session).toEqual({
        meta: {
          id: 'test-id',
          runNumber: 1,
          createdAt: '2025-01-01',
          lastUpdated: '2025-01-01'
        },
        settings: { bgMusic: true },
        pokedex: { found: 0, entries: [] },
        scores: {
          running: { round: 1, score: 0 },
          highest: { round: 1, score: 0 }
        },
        cards: { activeSet: [], clicked: new Set() }
      });

      expect(state.meta.get).toHaveBeenCalled();
      expect(state.settings.get).toHaveBeenCalled();
      expect(state.pokedex.get).toHaveBeenCalled();
      expect(state.scores.get).toHaveBeenCalled();
      expect(state.cards.get).toHaveBeenCalled();
    });
  });

  describe('import', () => {
    it('should import session data to all modules and return self', () => {
      const state = new GameState(constructorArgs);
      const mockSession: Session = {
        meta: {
          id: 'imported-id',
          runNumber: 10,
          createdAt: '2025-02-01',
          lastUpdated: '2025-02-01'
        },
        settings: { bgMusic: false },
        pokedex: { found: 50, entries: [{ id: 25, name: 'pikachu' }] },
        scores: {
          running: { round: 8, score: 500 },
          highest: { round: 10, score: 600 }
        },
        cards: { activeSet: [mockPokemonData[1]!], clicked: new Set([1, 2, 3]) }
      };

      const result = state.import(mockSession);

      expect(state.meta.import).toHaveBeenCalledWith(mockSession.meta);
      expect(state.settings.import).toHaveBeenCalledWith(mockSession.settings);
      expect(state.pokedex.import).toHaveBeenCalledWith(mockSession.pokedex);
      expect(state.scores.import).toHaveBeenCalledWith(mockSession.scores);
      expect(state.cards.import).toHaveBeenCalledWith(mockSession.cards);

      expect(result).toBe(state);
    });

    it('should handle import with empty session data', () => {
      const state = new GameState(constructorArgs);
      const emptySession: Session = {
        meta: { id: '', runNumber: 0, createdAt: '', lastUpdated: '' },
        settings: { bgMusic: false },
        pokedex: { found: 0, entries: [] },
        scores: {
          running: { round: 0, score: 0 },
          highest: { round: 0, score: 0 }
        },
        cards: { activeSet: [], clicked: new Set() }
      };

      const result = state.import(emptySession);

      expect(state.meta.import).toHaveBeenCalledWith(emptySession.meta);
      expect(state.settings.import).toHaveBeenCalledWith(emptySession.settings);
      expect(state.pokedex.import).toHaveBeenCalledWith(emptySession.pokedex);
      expect(state.scores.import).toHaveBeenCalledWith(emptySession.scores);
      expect(state.cards.import).toHaveBeenCalledWith(emptySession.cards);

      expect(result).toBe(state);
    });
  });

  describe('nextCardCount calculation edge cases', () => {
    it('should handle negative runNumber', () => {
      const state = new GameState(constructorArgs);
      vi.mocked(state.meta).runNumber = -1;

      expect(state.nextCardCount).toBe(0); // 2 + (-1) * 2 = 0
    });

    it('should handle large runNumber', () => {
      const state = new GameState(constructorArgs);
      vi.mocked(state.meta).runNumber = 100;

      expect(state.nextCardCount).toBe(202); // 2 + 100 * 2 = 202
    });

    it('should handle different baseCardCount', () => {
      const customArgs = { ...constructorArgs, baseCardCount: 10 };
      const state = new GameState(customArgs);
      vi.mocked(state.meta).runNumber = 5;

      expect(state.nextCardCount).toBe(20); // 10 + 5 * 2 = 20
    });
  });
});
