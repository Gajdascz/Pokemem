import { type MetaState, Meta } from './Meta/Meta';
import { type SettingsState, Settings } from './Settings/Settings';
import {
  type PokedexEntry,
  type PokedexState,
  Pokedex
} from './Pokedex/Pokedex';
import { type ScoreState, Score } from './Score/Score';
import { type CardsState, Cards } from './Cards/Cards';
import type { PokemonData } from '../../types';

export type { PokedexEntry, Pokedex } from './Pokedex/Pokedex';
export interface Session {
  meta: MetaState;
  settings: SettingsState;
  pokedex: PokedexState;
  scores: ScoreState;
  cards: CardsState;
}
export interface StateConstructorArgs {
  fetchPokemonData: (count: number) => Promise<PokemonData[]>;
  maxPokemonId: number;
  baseCardCount?: number;
  initialSession?: Session | null;
}
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
  set onMutateComplete(cb: () => void) {
    this._onMutateComplete = cb;
  }
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
        this._onMutateComplete?.(); // <-- trigger callback after fresh cache
      });
    };
  })();
  private mutateQueue: Promise<unknown> = Promise.resolve();
  mutate<T>(action: () => T): T;
  mutate<T>(action: () => Promise<T>): Promise<T>;
  mutate<T>(action: () => T | Promise<T>): T | Promise<T> {
    const result = action();
    if (!(result instanceof Promise)) {
      this.updateCache(); // immediate update
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

  get nextCardCount(): number {
    return this.baseCardCount + this._Scores.running.round * 2;
  }
  get session(): Session {
    return this._sessionCache;
  }
  async renewSession() {
    return this.mutate(async () => {
      this._Meta.reset();
      this._Settings.reset();
      this._Pokedex.reset();
      this._Scores.reset();
      await this._Cards.fetchNewActiveSet(this.baseCardCount);
    });
  }
  setBgMusic(state: boolean) {
    return this.mutate(() => {
      this._Settings.setBgMusic(state);
    });
  }
  async startNewRun() {
    return this.mutate(async () => {
      this._Meta.incrementRunNumber();
      this._Scores.resetRunning();
      await this._Cards.fetchNewActiveSet(this.baseCardCount);
    });
  }
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
