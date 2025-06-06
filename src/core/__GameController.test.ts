import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type Mock
} from 'vitest';
import { GameController } from './GameController';
import { GameState } from './GameState';
import { PokeApi } from './PokeApi';
import { LocalStorage } from './LocalStorage';
import { Emitter } from './Emitter';

vi.mock('./GameState');
vi.mock('./PokeApi');
vi.mock('./LocalStorage');
vi.mock('./Emitter');
vi.useFakeTimers();

describe('GameController', () => {
  let gameController: GameController;
  let mockState: any;
  let mockStorage: any;
  let mockEmitter: any;
  let mockSession: any;

  beforeEach(() => {
    vi.clearAllMocks();

    vi.clearAllMocks();

    mockSession = {
      meta: { runNumber: 1 },
      scores: { current: 0, best: 5 },
      cards: { active: [], clicked: [] },
      pokedex: { entries: [] },
      settings: { difficulty: 'normal' }
    };

    mockState = {
      session: mockSession,
      baseCardCount: 8,
      nextCardCount: 12,
      import: vi.fn(),
      setBgMusic: vi.fn(),
      startNewRun: vi.fn().mockResolvedValue(undefined),
      renewSession: vi.fn().mockResolvedValue(undefined),
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

    mockStorage = {
      current: mockSession,
      save: vi.fn(),
      export: vi.fn().mockReturnValue({ filename: 'pokemem-save' }),
      import: vi.fn(),
      reset: vi.fn()
    };

    mockEmitter = {
      emit: vi.fn(),
      on: vi.fn().mockReturnValue({ off: vi.fn() })
    };

    (GameState as Mock).mockImplementation(() => mockState);
    (LocalStorage as unknown as Mock).mockImplementation(() => mockStorage);
    (Emitter as unknown as Mock).mockImplementation(() => mockEmitter);

    (PokeApi.getRandomPokemonData as unknown as Mock).mockResolvedValue([]);

    gameController = new GameController({
      baseCardCount: 8,
      initialSession: mockSession,
      emitter: mockEmitter
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('should initialize with provided session and emitter', () => {
    expect(gameController.session).toBe(mockSession);
    expect(gameController.isLoading).toBe(false);
  });

  it('should call save', () => {
    gameController.save();
    expect(mockStorage.save).toHaveBeenCalledWith(mockSession);
  });

  it('should call exportSave', () => {
    const result = gameController.exportSave();
    expect(mockStorage.export).toHaveBeenCalledWith({
      filename: 'pokemem-save'
    });
    expect(result).toEqual({ filename: 'pokemem-save' });
  });

  it('should set bgMusic and sync', () => {
    gameController.setBgMusic(true);
    expect(mockState.setBgMusic).toHaveBeenCalledWith(true);
    // sync is debounced, so flush it
    (gameController as any).sync.flush();
    expect(mockStorage.save).toHaveBeenCalled();
  });

  it('should emit loading events on startNewRun', async () => {
    await gameController.startNewRun();
    expect(mockEmitter.emit).toHaveBeenCalledWith('startedLoading', true);
    expect(mockEmitter.emit).toHaveBeenCalledWith('doneLoading', true);
    expect(mockState.startNewRun).toHaveBeenCalled();
  });

  it('should emit loading events on startNewSession', async () => {
    await gameController.startNewSession();
    expect(mockEmitter.emit).toHaveBeenCalledWith('startedLoading', true);
    expect(mockEmitter.emit).toHaveBeenCalledWith('doneLoading', true);
    expect(mockStorage.reset).toHaveBeenCalled();
    expect(mockState.renewSession).toHaveBeenCalled();
  });

  it('should emit loading events and import session on loadSave', async () => {
    mockStorage.import.mockResolvedValue(undefined);
    mockStorage.current = mockSession;
    await gameController.loadSave(new File([''], 'save.json'));
    expect(mockEmitter.emit).toHaveBeenCalledWith('startedLoading', true);
    expect(mockEmitter.emit).toHaveBeenCalledWith('doneLoading', true);
    expect(mockStorage.import).toHaveBeenCalled();
    expect(mockState.import).toHaveBeenCalledWith(mockSession);
  });

  it('should throw error if no save data provided to loadSave', async () => {
    await expect(gameController.loadSave()).rejects.toThrow(
      'No save data provided'
    );
  });

  it('should throw error if storage.current is missing after import', async () => {
    mockStorage.import.mockResolvedValue(undefined);
    mockStorage.current = null;
    await expect(
      gameController.loadSave(new File([''], 'save.json'))
    ).rejects.toThrow('Invalid save data');
  });

  it('should call onLoading and onSync', () => {
    const cb = vi.fn();
    gameController.onLoading('startedLoading', cb);
    expect(mockEmitter.on).toHaveBeenCalledWith('startedLoading', cb);
    gameController.onSync(cb);
    expect(mockEmitter.on).toHaveBeenCalledWith('sync', cb);
  });

  it('should handle card click and call state.handleCardClick', async () => {
    mockState.handleCardClick = vi.fn().mockResolvedValue(undefined);
    await gameController.onCardClick({ id: 1, name: 'bulbasaur' });
    expect(mockState.handleCardClick).toHaveBeenCalledWith({
      id: 1,
      name: 'bulbasaur'
    });
    expect(mockEmitter.emit).toHaveBeenCalledWith('startedLoading', true);
    expect(mockEmitter.emit).toHaveBeenCalledWith('doneLoading', true);
    // sync is debounced, so flush it
    (gameController as any).sync.flush();
    expect(mockStorage.save).toHaveBeenCalled();
  });

  it('should rethrow non-Error in onCardClick as Error', async () => {
    mockState.handleCardClick = vi.fn().mockRejectedValue('fail');
    await expect(
      gameController.onCardClick({ id: 1, name: 'bulbasaur' })
    ).rejects.toThrow('An unexpected error occurred while handling card click');
  });

  it('should rethrow Error in onCardClick', async () => {
    mockState.handleCardClick = vi.fn().mockRejectedValue(new Error('fail'));
    await expect(
      gameController.onCardClick({ id: 1, name: 'bulbasaur' })
    ).rejects.toThrow('fail');
  });

  it('should flush sync on beforeunload and visibilitychange', () => {
    const flush = vi.fn();
    (gameController as any).sync.flush = flush;
    window.dispatchEvent(new Event('beforeunload'));
    expect(flush).toHaveBeenCalled();
    document.dispatchEvent(new Event('visibilitychange'));
    expect(flush).toHaveBeenCalled();
  });
});
