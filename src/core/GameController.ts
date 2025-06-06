/**
 * GameController coordinates the main game logic,
 * state management, save/load operations,
 * and event emission. It acts as the central
 * orchestrator between UI, state, and persistence.
 *
 * @module GameController
 */

import {
  GameState,
  type Session,
  type StateConstructorArgs,
  type PokedexEntry
} from './GameState';
import { PokeApi } from './PokeApi';
import { LocalStorage } from './LocalStorage';
import { type Subscriber, type Subscription, Emitter } from './Emitter';
import { debounce } from './utils';

const SAVE_FILE_NAME = 'pokemem-save';
const ERR_MSGS = {
  NO_SAVE_DATA: 'No save data provided',
  INVALID_SAVE_DATA: 'Invalid save data'
} as const;
export type { Session };

/** Loading event types for the GameController. */
export type LoadingEvent = 'startedLoading' | 'doneLoading';
/** All event types emitted by GameController. */
export type GameControllerEvent = LoadingEvent | 'sync';
/** Emitter type for GameController events. */
export type GameControllerEmitter = Emitter<
  { [L in LoadingEvent]: boolean } & { sync: Session }
>;
/** Main controller for Pokémem game logic, state, and persistence. */
export class GameController {
  /** Saves the current session to local storage. */
  save() {
    this.storage.save(this.state.session);
  }
  /**
   * Debounced sync function to save state
   * and emit a sync event.
   * Used to avoid excessive writes to storage.
   */
  private sync = debounce(() => {
    this.save();
    this.emitter.emit('sync', this.state.session);
  }, 100);
  /**
   * Marks the controller as loading and
   * emits a loading event.
   */
  private startLoading() {
    this.loading = true;
    this.emitter.emit('startedLoading', true);
  }

  /**
   * Marks the controller as done loading and
   * emits a loading event.
   */
  private doneLoading() {
    this.loading = false;
    this.emitter.emit('doneLoading', true);
  }
  /**
   * Utility to wrap an action with
   * loading state management.
   * @param action - The action to perform while loading.
   */
  private async withLoading(action: () => void | Promise<void>) {
    this.startLoading();
    try {
      await action();
    } finally {
      this.doneLoading();
    }
  }

  private state: GameState;
  private storage: LocalStorage<'pokemem', Session>;
  private emitter: GameControllerEmitter;
  private loading = false;

  /**
   * Constructs a new GameController.
   * @param params - Configuration for initial state and emitter.
   */
  constructor({
    baseCardCount,
    initialSession,
    emitter = new Emitter()
  }: Omit<StateConstructorArgs, 'fetchPokemonData' | 'maxPokemonId'> & {
    emitter?: GameControllerEmitter;
  }) {
    this.storage = new LocalStorage<'pokemem', Session>('pokemem');
    this.state = new GameState({
      initialSession: initialSession ?? this.storage.current,
      fetchPokemonData: PokeApi.getRandomPokemonData.bind(PokeApi),
      maxPokemonId: PokeApi.maxId,
      baseCardCount
    });
    this.emitter = emitter;
    this.state.onMutateComplete = () => this.sync();
    window.addEventListener('beforeunload', () => this.sync.flush());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') this.sync.flush();
    });
  }
  /** Returns the current session state. */
  get session() {
    return this.state.session;
  }
  /** Returns whether the controller is currently loading. */
  get isLoading() {
    return this.loading;
  }
  /** Starts a new run within the current session. */
  async startNewRun() {
    return this.withLoading(async () => await this.state.startNewRun());
  }
  /**
   * Starts a completely new session,
   * resetting all progress.
   */
  async startNewSession() {
    return this.withLoading(async () => {
      this.storage.reset();
      await this.state.renewSession();
    });
  }
  /**
   * Loads a save file and imports its data
   * into the game.
   * @param data - The save file to import.
   * @throws If no data or invalid data is provided.
   */
  async loadSave(data?: File) {
    return this.withLoading(async () => {
      if (!data) throw new Error(ERR_MSGS.NO_SAVE_DATA);
      await this.storage.import(data);
      if (!this.storage.current) throw new Error(ERR_MSGS.INVALID_SAVE_DATA);
      this.state.import(this.storage.current);
      this.sync.flush();
    });
  }
  /** Exports the current save data as a file. */
  exportSave() {
    return this.storage.export({ filename: SAVE_FILE_NAME });
  }
  /**
   * Handles a card click event, updating state
   * and syncing.
   * @param entry - The clicked Pokémon entry.
   */
  async onCardClick(entry: PokedexEntry) {
    return this.withLoading(async () => {
      try {
        await this.state.handleCardClick(entry);
        this.sync();
      } catch (error) {
        throw error instanceof Error ? error : (
            new Error('An unexpected error occurred while handling card click')
          );
      }
    });
  }
  /**
   * Subscribes to loading events.
   * @param event - The loading event type.
   * @param callback - Callback to invoke on event.
   * @returns Subscription handle.
   */
  onLoading(event: LoadingEvent, callback: Subscriber<boolean>): Subscription {
    return this.emitter.on(event, callback);
  }
  /**
   * Subscribes to sync events.
   * @param callback - Callback to invoke on sync.
   * @returns Subscription handle.
   */
  onSync(callback: Subscriber<Session>): Subscription {
    return this.emitter.on('sync', callback);
  }
  /**
   * Sets the background music state and syncs.
   * @param state - Whether background music should be enabled.
   */
  setBgMusic(state: boolean) {
    this.state.setBgMusic(state);
    this.sync();
  }
}
/**
 * Interface describing the actions
 * exposed by GameController.
 */
export interface GameControllerActions {
  get isLoading(): boolean;
  get session(): Session;
  save: () => void;
  exportSave: () => void;
  loadSave: (saveData?: File) => Promise<void>;
  startNewRun: () => Promise<void>;
  startNewSession: () => Promise<void>;
  onCardClick: (entry: PokedexEntry) => Promise<void>;
  onLoading: (
    event: LoadingEvent,
    callback: Subscriber<boolean>
  ) => Subscription;
  onSync: (callback: Subscriber<Session>) => Subscription;
  setBgMusic: (state: boolean) => void;
}
