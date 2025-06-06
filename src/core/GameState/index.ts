import { type MetaState, Meta } from './Meta/Meta';
import { type SettingsState, Settings } from './Settings/Settings';
import {
  type PokedexEntry,
  type PokedexState,
  Pokedex
} from './Pokedex/Pokedex';
import { type ScoreState, Score } from './Score/Score';
import { type CardsState, Cards } from './Cards/Cards';
import type { PokeApi } from '../PokeApi/index';

export type { PokedexEntry, Pokedex } from './Pokedex/Pokedex';

/**
 * Represents the full session state for the game.
 */
export interface Session {
  meta: MetaState;
  settings: SettingsState;
  pokedex: PokedexState;
  scores: ScoreState;
  cards: CardsState;
}

/**
 * Arguments required to construct a GameState instance.
 */
export interface StateConstructorArgs {
  fetchPokemonData: (count: number) => Promise<PokeApi.PokemonData[]>;
  maxPokemonId: number;
  baseCardCount?: number;
  initialSession?: Session | null;
}

/**
 * GameState manages the entire game session state, including meta info,
 * user settings, pokedex progress, scores, and active cards.
 * Provides mutation batching, session import/export, and state reset logic.
 */
export class GameState {
  public readonly maxPokemonId: number;
  public readonly baseCardCount: number;
  private _Meta: Meta;
  private _Settings: Settings;
  private _Pokedex: Pokedex;
  private _Scores: Score;
  private _Cards: Cards;
  private _sessionCache: Session;
  private _onMutateComplete?: () => void;
  private _processing = false;

  /**
   * Optional callback triggered after a mutation and cache update.
   */
  set onMutateComplete(cb: () => void) {
    this._onMutateComplete = cb;
  }

  /**
   * Constructs a new GameState instance.
   * @param fetchPokemonData - Function to fetch Pokémon data for cards.
   * @param maxPokemonId - The maximum Pokémon ID for the session.
   * @param baseCardCount - The starting number of cards per round.
   * @param initialSession - Optional initial session state.
   */
  constructor({
    fetchPokemonData,
    maxPokemonId,
    baseCardCount = 2,
    initialSession
  }: StateConstructorArgs) {
    this.maxPokemonId = maxPokemonId;
    this.baseCardCount = baseCardCount;
    const { cards, meta, pokedex, scores, settings } = initialSession ?? {};
    this._Meta = new Meta(meta);
    this._Settings = new Settings(settings);
    this._Pokedex = new Pokedex(maxPokemonId, pokedex);
    this._Scores = new Score(scores);
    this._Cards = new Cards(fetchPokemonData, cards);
    this._sessionCache = Object.freeze(
      structuredClone({
        meta: this._Meta.state,
        settings: this._Settings.state,
        pokedex: this._Pokedex.state,
        scores: this._Scores.state,
        cards: this._Cards.state
      })
    );
  }

  /**
   * Schedules a session cache update after mutations.
   * Uses microtasks to batch updates and trigger the onMutateComplete callback.
   */
  private updateCache = (() => {
    let scheduled = false;
    return () => {
      if (scheduled) return;
      scheduled = true;
      queueMicrotask(() => {
        this._sessionCache = Object.freeze(
          structuredClone({
            meta: this._Meta.state,
            settings: this._Settings.state,
            pokedex: this._Pokedex.state,
            scores: this._Scores.state,
            cards: this._Cards.state
          })
        );
        scheduled = false;
        this._onMutateComplete?.(); // Trigger callback after fresh cache
      });
    };
  })();

  /** Internal queue to serialize async mutations. */
  private mutateQueue: Promise<unknown> = Promise.resolve();

  /**
   * Mutates the state, batching updates and ensuring cache consistency.
   * Supports both sync and async actions.
   * @param action - The mutation function to execute.
   */
  mutate<T>(action: () => T): T;
  mutate<T>(action: () => Promise<T>): Promise<T>;
  mutate<T>(action: () => T | Promise<T>): T | Promise<T> {
    const result = action();
    if (!(result instanceof Promise)) {
      this.updateCache(); // Immediate update for sync actions
      return result;
    }
    const next = this.mutateQueue.then(async () => {
      const value = await result;
      this.updateCache();
      return value;
    });
    this.mutateQueue = next.catch(() => {
      return;
    });
    return next;
  }

  /** Calculates the number of cards for the next round. */
  get nextCardCount(): number {
    return this.baseCardCount + this._Scores.running.round * 2;
  }

  /** Returns the current session state (frozen, safe for external use). */
  get session(): Session {
    return this._sessionCache;
  }

  /**
   * Resets all state to a new session and fetches a new set of cards.
   */
  async renewSession() {
    return this.mutate(async () => {
      this._Meta.reset();
      this._Settings.reset();
      this._Pokedex.reset();
      this._Scores.reset();
      await this._Cards.fetchNewActiveSet(this.baseCardCount);
    });
  }

  /**
   * Sets the background music setting.
   * @param state - True to enable, false to disable.
   */
  setBgMusic(state: boolean) {
    return this.mutate(() => {
      this._Settings.setBgMusic(state);
    });
  }

  /**
   * Starts a new run: increments run number, resets running score, and fetches new cards.
   */
  async startNewRun() {
    return this.mutate(async () => {
      this._Meta.incrementRunNumber();
      this._Scores.resetRunning();
      await this._Cards.fetchNewActiveSet(this.baseCardCount);
    });
  }

  /**
   * Handles a successful card click: marks as clicked, updates score and pokedex,
   * and advances round or shuffles as needed.
   * @param param0 - The clicked card's pokedex entry.
   */
  private async successfulClick({ id, name }: PokedexEntry) {
    return this.mutate(async () => {
      this._Cards.addClicked(id);
      this._Scores.incrementScore();
      this._Pokedex.addEntry({ id, name });
      if (this._Cards.isAllActiveClicked()) {
        this._Scores.incrementRound();
        await this._Cards.fetchNewActiveSet(this.nextCardCount);
      } else this._Cards.shuffle();
    });
  }

  /**
   * Handles a card click event, managing game logic and preventing concurrent clicks.
   * @param param0 - The clicked card's pokedex entry.
   */
  async handleCardClick({ id, name }: PokedexEntry) {
    if (this._processing) {
      console.warn('Click ignored, already processing another click.');
      return;
    }
    return this.mutate(async () => {
      this._processing = true;
      if (this._Cards.hasClicked(id)) await this.startNewRun();
      else await this.successfulClick({ id, name });
      this._processing = false;
    });
  }

  /**
   * Imports a full session state, replacing all sub-states.
   * @param session - The session to import.
   */
  import(session: Session) {
    return this.mutate(() => {
      this._Meta.import(session.meta);
      this._Settings.import(session.settings);
      this._Pokedex.import(session.pokedex);
      this._Scores.import(session.scores);
      this._Cards.import(session.cards);
    });
  }
}
