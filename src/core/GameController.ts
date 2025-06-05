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
export type LoadingEvent = 'startedLoading' | 'doneLoading';
export type GameControllerEvent = LoadingEvent | 'sync';
export type GameControllerEmitter = Emitter<
  { [L in LoadingEvent]: boolean } & { sync: Session }
>;
export class GameController {
  save() {
    this.storage.save(this.state.session);
  }
  private sync = debounce(() => {
    this.save();
    this.emitter.emit('sync', this.state.session);
  }, 100);
  private startLoading() {
    this.loading = true;
    this.emitter.emit('startedLoading', true);
  }
  private doneLoading() {
    this.loading = false;
    this.emitter.emit('doneLoading', true);
  }
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
  get session() {
    return this.state.session;
  }
  get isLoading() {
    return this.loading;
  }
  async startNewRun() {
    return this.withLoading(async () => await this.state.startNewRun());
  }
  async startNewSession() {
    return this.withLoading(async () => {
      this.storage.reset();
      await this.state.renewSession();
    });
  }
  async loadSave(data?: File) {
    return this.withLoading(async () => {
      if (!data) throw new Error(ERR_MSGS.NO_SAVE_DATA);
      await this.storage.import(data);
      if (!this.storage.current) throw new Error(ERR_MSGS.INVALID_SAVE_DATA);
      this.state.import(this.storage.current);
      this.sync.flush();
    });
  }
  exportSave() {
    return this.storage.export({ filename: SAVE_FILE_NAME });
  }

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
  onLoading(event: LoadingEvent, callback: Subscriber<boolean>): Subscription {
    return this.emitter.on(event, callback);
  }
  onSync(callback: Subscriber<Session>): Subscription {
    return this.emitter.on('sync', callback);
  }
  setBgMusic(state: boolean) {
    this.state.setBgMusic(state);
    this.sync();
  }
}

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
