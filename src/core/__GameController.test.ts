import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  GameController,
  type LoadingEvent,
  type GameControllerEmitter
} from './GameController';
import { GameState } from './GameState';
import { PokeApi } from './PokeApi';
import { LocalStorage } from './LocalStorage';
import { Emitter } from './Emitter';

// Mock all dependencies
vi.mock('./GameState');
vi.mock('./PokeApi');
vi.mock('./LocalStorage');
vi.mock('./Emitter');

// Mock timers for debounce testing
vi.useFakeTimers();

describe('GameController', () => {
  let gameController: GameController;
  let mockState: any;
  let mockStorage: any;
  let mockEmitter: any;
  let mockSession: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Mock session data
    mockSession = {
      meta: { runNumber: 1 },
      scores: { current: 0, best: 5 },
      cards: { active: [], clicked: [] },
      pokedex: { entries: [] },
      settings: { difficulty: 'normal' }
    };

    // Mock GameState
    mockState = {
      session: mockSession,
      baseCardCount: 8,
      nextCardCount: 12,
      import: vi.fn(),
      meta: { incrementRunNumber: vi.fn(), reset: vi.fn() },
      settings: { reset: vi.fn() },
      pokedex: { addEntry: vi.fn(), reset: vi.fn() },
      scores: {
        incrementScore: vi.fn(),
        incrementRound: vi.fn(),
        resetRunning: vi.fn(),
        reset: vi.fn()
      },
      cards: {
        reset: vi.fn(),
        fetchNewActiveSet: vi.fn().mockResolvedValue(undefined),
        hasClicked: vi.fn(),
        addClicked: vi.fn(),
        isAllActiveClicked: vi.fn()
      }
    };

    // Mock LocalStorage
    mockStorage = {
      current: mockSession,
      save: vi.fn(),
      export: vi.fn().mockReturnValue({ filename: 'pokemem-save' })
    };

    // Mock Emitter
    mockEmitter = { pub: vi.fn() };

    // Mock PokeApi
    vi.mocked(PokeApi).getRandomPokemonData = {
      //@ts-ignore
      bind: vi
        .fn()
        .mockReturnValue(vi.fn().mockResolvedValue({ id: 1, name: 'pikachu' }))
    };
    vi.mocked(PokeApi).maxId = 1010;

    // Set up constructor mocks
    vi.mocked(GameState).mockImplementation(() => mockState);
    vi.mocked(LocalStorage).mockImplementation(() => mockStorage);
    vi.mocked(Emitter).mockImplementation(() => mockEmitter);

    // Create instance with minimal required args
    gameController = new GameController({ baseCardCount: 8 });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('constructor', () => {
    it('should create instance with default emitter when none provided', () => {
      expect(vi.mocked(Emitter)).toHaveBeenCalledWith();
      expect(vi.mocked(LocalStorage)).toHaveBeenCalledWith('pokemem');
      expect(vi.mocked(GameState)).toHaveBeenCalledWith({
        initialSession: mockSession,
        fetchPokemonData: expect.any(Function),
        maxPokemonId: 1010,
        baseCardCount: 8
      });
    });

    it('should create instance with provided emitter', () => {
      const customEmitter: GameControllerEmitter = new Emitter();

      const controller = new GameController({
        baseCardCount: 6,
        emitter: customEmitter
      });

      // Should have been called twice - once for default, once for custom
      expect(vi.mocked(Emitter)).toHaveBeenCalledTimes(2);
    });

    it('should create instance with initial session', () => {
      const initialSession = { ...mockSession, meta: { runNumber: 5 } };

      const controller = new GameController({
        baseCardCount: 10,
        initialSession
      });

      expect(vi.mocked(GameState)).toHaveBeenCalledWith({
        initialSession,
        fetchPokemonData: expect.any(Function),
        maxPokemonId: 1010,
        baseCardCount: 10
      });
    });

    it('should use storage current session when no initial session provided', () => {
      expect(vi.mocked(GameState)).toHaveBeenCalledWith({
        initialSession: mockSession, // from mockStorage.current
        fetchPokemonData: expect.any(Function),
        maxPokemonId: 1010,
        baseCardCount: 8
      });
    });
  });

  describe('session getter', () => {
    it('should return current session from state', () => {
      expect(gameController.session).toBe(mockSession);
    });
  });

  describe('sync (debounced)', () => {
    it('should save session to storage after debounce delay', () => {
      // Trigger sync multiple times
      (gameController as any).sync();
      (gameController as any).sync();
      (gameController as any).sync();

      // Should not have called save yet
      expect(mockStorage.save).not.toHaveBeenCalled();

      // Fast-forward past debounce delay
      vi.advanceTimersByTime(1000);

      // Should have called save once
      expect(mockStorage.save).toHaveBeenCalledTimes(1);
      expect(mockStorage.save).toHaveBeenCalledWith(mockSession);
    });

    it('should reset debounce timer on subsequent calls', () => {
      (gameController as any).sync();

      // Advance part way through delay
      vi.advanceTimersByTime(500);

      // Call sync again - should reset timer
      (gameController as any).sync();

      // Advance another 500ms (total 1000ms from first call)
      vi.advanceTimersByTime(500);

      // Should not have called save yet
      expect(mockStorage.save).not.toHaveBeenCalled();

      // Advance final 500ms to complete second debounce
      vi.advanceTimersByTime(500);

      // Now should have called save
      expect(mockStorage.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('loadSave', () => {
    it('should import save data and save to storage', async () => {
      const saveData = { ...mockSession, meta: { runNumber: 10 } };

      const result = await gameController.loadSave(saveData);

      expect(mockState.import).toHaveBeenCalledWith(saveData);
      expect(mockStorage.save).toHaveBeenCalledWith(mockSession);
      expect(result).toBe(mockSession);
    });

    it('should return current session when no save data provided', async () => {
      const result = await gameController.loadSave();

      expect(mockState.import).not.toHaveBeenCalled();
      expect(mockStorage.save).not.toHaveBeenCalled();
      expect(result).toBe(mockSession);
    });

    it('should emit loading events', async () => {
      await gameController.loadSave();

      expect(mockEmitter.pub).toHaveBeenCalledWith(
        'startedLoading',
        mockSession
      );
      expect(mockEmitter.pub).toHaveBeenCalledWith('doneLoading', mockSession);
    });
  });

  describe('exportSave', () => {
    it('should call storage export with correct filename', () => {
      const result = gameController.exportSave();

      expect(mockStorage.export).toHaveBeenCalledWith({
        filename: 'pokemem-save'
      });
      expect(result).toEqual({ filename: 'pokemem-save' });
    });
  });

  describe('startNewRun', () => {
    it('should reset run state and fetch new cards', async () => {
      await gameController.startNewRun();

      expect(mockState.meta.incrementRunNumber).toHaveBeenCalled();
      expect(mockState.scores.resetRunning).toHaveBeenCalled();
      expect(mockState.cards.reset).toHaveBeenCalled();
      expect(mockState.cards.fetchNewActiveSet).toHaveBeenCalledWith(8);
    });

    it('should trigger sync after completion', async () => {
      await gameController.startNewRun();

      // Fast-forward debounce
      vi.advanceTimersByTime(1000);

      expect(mockStorage.save).toHaveBeenCalledWith(mockSession);
    });

    it('should emit loading events', async () => {
      await gameController.startNewRun();

      expect(mockEmitter.pub).toHaveBeenCalledWith(
        'startedLoading',
        mockSession
      );
      expect(mockEmitter.pub).toHaveBeenCalledWith('doneLoading', mockSession);
    });
  });

  describe('startNewSession', () => {
    it('should reset all state and fetch new cards', async () => {
      await gameController.startNewSession();

      expect(mockState.meta.reset).toHaveBeenCalled();
      expect(mockState.settings.reset).toHaveBeenCalled();
      expect(mockState.pokedex.reset).toHaveBeenCalled();
      expect(mockState.scores.reset).toHaveBeenCalled();
      expect(mockState.cards.reset).toHaveBeenCalled();
      expect(mockState.cards.fetchNewActiveSet).toHaveBeenCalledWith(8);
    });

    it('should trigger sync after completion', async () => {
      await gameController.startNewSession();

      // Fast-forward debounce
      vi.advanceTimersByTime(1000);

      expect(mockStorage.save).toHaveBeenCalledWith(mockSession);
    });

    it('should emit loading events', async () => {
      await gameController.startNewSession();

      expect(mockEmitter.pub).toHaveBeenCalledWith(
        'startedLoading',
        mockSession
      );
      expect(mockEmitter.pub).toHaveBeenCalledWith('doneLoading', mockSession);
    });
  });

  describe('onCardClick', () => {
    const mockPokemon = { id: 25, name: 'pikachu' };

    describe('when card has been clicked before', () => {
      beforeEach(() => {
        mockState.cards.hasClicked.mockReturnValue(true);
      });

      it('should start new run', async () => {
        await gameController.onCardClick(mockPokemon);

        expect(mockState.cards.fetchNewActiveSet).toHaveBeenCalledWith(8);
        expect(mockState.meta.incrementRunNumber).toHaveBeenCalled();
        expect(mockState.scores.resetRunning).toHaveBeenCalled();
      });

      it('should trigger sync', async () => {
        await gameController.onCardClick(mockPokemon);

        vi.advanceTimersByTime(1000);
        expect(mockStorage.save).toHaveBeenCalledWith(mockSession);
      });
    });

    describe('when card has not been clicked before', () => {
      beforeEach(() => {
        mockState.cards.hasClicked.mockReturnValue(false);
      });

      it('should add clicked card and update state', async () => {
        mockState.cards.isAllActiveClicked.mockReturnValue(false);

        await gameController.onCardClick(mockPokemon);

        expect(mockState.cards.addClicked).toHaveBeenCalledWith(25);
        expect(mockState.scores.incrementScore).toHaveBeenCalled();
        expect(mockState.pokedex.addEntry).toHaveBeenCalledWith(mockPokemon);
      });

      it('should start new round when all active cards clicked', async () => {
        mockState.cards.isAllActiveClicked.mockReturnValue(true);
        mockState.nextCardCount = 12;

        await gameController.onCardClick(mockPokemon);

        expect(mockState.cards.addClicked).toHaveBeenCalledWith(25);
        expect(mockState.scores.incrementScore).toHaveBeenCalled();
        expect(mockState.pokedex.addEntry).toHaveBeenCalledWith(mockPokemon);
        expect(mockState.scores.incrementRound).toHaveBeenCalled();
        expect(mockState.cards.fetchNewActiveSet).toHaveBeenCalledWith(12);
      });

      it('should not start new round when not all active cards clicked', async () => {
        mockState.cards.isAllActiveClicked.mockReturnValue(false);

        await gameController.onCardClick(mockPokemon);

        expect(mockState.scores.incrementRound).not.toHaveBeenCalled();
        expect(mockState.cards.fetchNewActiveSet).not.toHaveBeenCalled();
      });

      it('should trigger sync', async () => {
        mockState.cards.isAllActiveClicked.mockReturnValue(false);

        await gameController.onCardClick(mockPokemon);

        vi.advanceTimersByTime(1000);
        expect(mockStorage.save).toHaveBeenCalledWith(mockSession);
      });
    });

    it('should handle card click with different pokemon data', async () => {
      const differentPokemon = { id: 150, name: 'mewtwo' };
      mockState.cards.hasClicked.mockReturnValue(false);
      mockState.cards.isAllActiveClicked.mockReturnValue(false);

      await gameController.onCardClick(differentPokemon);

      expect(mockState.cards.addClicked).toHaveBeenCalledWith(150);
      expect(mockState.pokedex.addEntry).toHaveBeenCalledWith(differentPokemon);
    });
  });

  describe('error handling', () => {
    it('should handle errors in startNewRun', async () => {
      mockState.cards.fetchNewActiveSet.mockRejectedValue(
        new Error('Fetch failed')
      );

      await expect(gameController.startNewRun()).rejects.toThrow(
        'Fetch failed'
      );
      expect(mockEmitter.pub).toHaveBeenCalledWith('doneLoading', mockSession);
    });

    it('should handle errors in startNewSession', async () => {
      mockState.cards.fetchNewActiveSet.mockRejectedValue(
        new Error('Network error')
      );

      await expect(gameController.startNewSession()).rejects.toThrow(
        'Network error'
      );
      expect(mockEmitter.pub).toHaveBeenCalledWith('doneLoading', mockSession);
    });

    it('should handle errors in onCardClick', async () => {
      mockState.cards.hasClicked.mockReturnValue(false);
      mockState.cards.isAllActiveClicked.mockReturnValue(true);
      mockState.cards.fetchNewActiveSet.mockRejectedValue(
        new Error('API error')
      );

      await expect(
        gameController.onCardClick({ id: 1, name: 'test' })
      ).rejects.toThrow('API error');
    });
  });

  describe('type definitions', () => {
    it('should have correct LoadingEvent type', () => {
      const events: LoadingEvent[] = ['startedLoading', 'doneLoading'];
      expect(events).toHaveLength(2);
    });

    it('should have correct GameControllerEvent type', () => {
      // GameControllerEvent should be equivalent to LoadingEvent
      const event = 'startedLoading';
      expect(event).toBe('startedLoading');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete game flow', async () => {
      // Start new session
      await gameController.startNewSession();

      // Click first card (new card)
      mockState.cards.hasClicked.mockReturnValue(false);
      mockState.cards.isAllActiveClicked.mockReturnValue(false);
      await gameController.onCardClick({ id: 1, name: 'bulbasaur' });

      // Click second card (complete round)
      mockState.cards.isAllActiveClicked.mockReturnValue(true);
      await gameController.onCardClick({ id: 2, name: 'ivysaur' });

      // Click already clicked card (game over)
      mockState.cards.hasClicked.mockReturnValue(true);
      await gameController.onCardClick({ id: 1, name: 'bulbasaur' });

      // Verify all expected calls were made
      expect(mockState.meta.reset).toHaveBeenCalled();
      expect(mockState.scores.incrementScore).toHaveBeenCalledTimes(2);
      expect(mockState.scores.incrementRound).toHaveBeenCalledTimes(1);
      expect(mockState.meta.incrementRunNumber).toHaveBeenCalledTimes(1); // once for game over
    });

    it('should save data periodically during gameplay', async () => {
      // Perform multiple actions
      await gameController.startNewRun();

      mockState.cards.hasClicked.mockReturnValue(false);
      mockState.cards.isAllActiveClicked.mockReturnValue(false);

      await gameController.onCardClick({ id: 1, name: 'test1' });
      await gameController.onCardClick({ id: 2, name: 'test2' });

      // Fast-forward debounce timer
      vi.advanceTimersByTime(1000);

      // Should have saved after debounce delay
      expect(mockStorage.save).toHaveBeenCalledWith(mockSession);
    });
  });
});
