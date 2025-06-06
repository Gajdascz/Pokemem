import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameState, type Session } from './index';
import type { PokeApi } from '../PokeApi';

function makePokemonData(id: number): PokeApi.PokemonData {
  return { id, name: `poke${id}`, type: 'type', img: `img${id}.png` };
}

const fetchPokemonData = vi.fn(async (count: number) =>
  Array.from({ length: count }, (_, i) => makePokemonData(i + 1))
);

const maxPokemonId = 5;
const baseCardCount = 2;

function makeSession(): Session {
  return {
    meta: {
      id: 'meta-id',
      runNumber: 1,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    },
    settings: { bgMusic: true },
    pokedex: {
      found: 1,
      entries: [
        { id: 0, name: 'poke0' },
        { id: 1, name: null },
        { id: 2, name: null },
        { id: 3, name: null },
        { id: 4, name: null }
      ]
    },
    scores: {
      running: { round: 0, score: 0 },
      highest: { round: 0, score: 0 }
    },
    cards: {
      activeSet: [makePokemonData(1), makePokemonData(2)],
      clicked: new Set()
    }
  };
}

describe('GameState', () => {
  let state: GameState;

  beforeEach(() => {
    fetchPokemonData.mockClear();
    state = new GameState({ fetchPokemonData, maxPokemonId, baseCardCount });
  });

  it('should initialize with default state', () => {
    expect(state.maxPokemonId).toBe(maxPokemonId);
    expect(state.baseCardCount).toBe(baseCardCount);
    expect(state.session.meta).toBeDefined();
    expect(state.session.settings).toBeDefined();
    expect(state.session.pokedex).toBeDefined();
    expect(state.session.scores).toBeDefined();
    expect(state.session.cards).toBeDefined();
  });

  it('should initialize with provided session', () => {
    const session = makeSession();
    const s = new GameState({
      fetchPokemonData,
      maxPokemonId,
      baseCardCount,
      initialSession: session
    });
    expect(s.session.meta.id).toBe('meta-id');
    expect(s.session.settings.bgMusic).toBe(true);
    expect(s.session.pokedex.entries[0]?.name).toBe('poke0');
    expect(s.session.scores.running.score).toBe(0);
    expect(Array.isArray(s.session.cards.activeSet)).toBe(true);
  });

  it('should update session cache after mutation', async () => {
    const oldSession = state.session;
    await state.renewSession();
    expect(state.session).not.toBe(oldSession);
    expect(state.session.meta).not.toBe(oldSession.meta);
  });

  it('should call onMutateComplete after mutation', async () => {
    const cb = vi.fn();
    state.onMutateComplete = cb;
    await state.renewSession();
    // queueMicrotask is async, so wait for next tick
    await new Promise((r) => setTimeout(r, 0));
    expect(cb).toHaveBeenCalled();
  });

  it('should reset all state on renewSession', async () => {
    await state.renewSession();
    expect(state.session.scores.running.score).toBe(0);
    expect(state.session.pokedex.found).toBe(0);
    expect(state.session.cards.activeSet.length).toBe(baseCardCount);
  });

  it('should set bgMusic', async () => {
    await state.setBgMusic(true);
    expect(state.session.settings.bgMusic).toBe(true);
    await state.setBgMusic(false);
    expect(state.session.settings.bgMusic).toBe(false);
  });

  it('should start new run', async () => {
    await state.startNewRun();
    expect(state.session.meta.runNumber).toBe(1);
    expect(state.session.scores.running.score).toBe(0);
    expect(state.session.cards.activeSet.length).toBe(baseCardCount);
  });

  it('should import session', async () => {
    const session = makeSession();
    await state.import(session);
    expect(state.session.meta.id).toBe('meta-id');
    expect(state.session.settings.bgMusic).toBe(true);
    expect(state.session.pokedex.entries[0]?.name).toBe('poke0');
  });

  it('should handle successful card click and shuffle if not all clicked', async () => {
    await state.renewSession();
    const card = state.session.cards.activeSet[0]!;
    await state.handleCardClick({ id: card.id, name: card.name });
    expect(state.session.scores.running.score).toBe(1);
    expect(state.session.pokedex.entries[card.id]?.name).toBe(card.name);
  });

  it('should handle successful card click and fetch new set if all clicked', async () => {
    await state.renewSession();
    // Click all cards
    for (const card of state.session.cards.activeSet) {
      await state.handleCardClick({ id: card.id, name: card.name });
    }
    expect(state.session.scores.running.round).toBe(1);
    expect(state.session.cards.activeSet.length).toBe(state.nextCardCount);
  });

  it('should start new run if card already clicked', async () => {
    await state.renewSession();
    const card = state.session.cards.activeSet[0]!;
    await state.handleCardClick({ id: card.id, name: card.name });
    // Click again triggers new run
    await state.handleCardClick({ id: card.id, name: card.name });
    expect(state.session.scores.running.score).toBe(0);
    expect(state.session.meta.runNumber).toBe(1);
  });

  it('should ignore clicks while processing', async () => {
    await state.renewSession();
    state['_processing'] = true;
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const card = state.session.cards.activeSet[0]!;
    await state.handleCardClick({ id: card.id, name: card.name });
    expect(warn).toHaveBeenCalledWith(
      'Click ignored, already processing another click.'
    );
    warn.mockRestore();
  });

  it('should allow chaining of mutate for sync and async actions', async () => {
    let syncRan = false;
    state.mutate(() => {
      syncRan = true;
    });
    expect(syncRan).toBe(true);

    let asyncRan = false;
    await state.mutate(async () => {
      asyncRan = true;
    });
    expect(asyncRan).toBe(true);
  });

  it('should update nextCardCount as rounds increase', async () => {
    await state.renewSession();
    expect(state.nextCardCount).toBe(baseCardCount);
    // Simulate a round
    for (const card of state.session.cards.activeSet) {
      await state.handleCardClick({ id: card.id, name: card.name });
    }
    expect(state.nextCardCount).toBe(baseCardCount + 2);
  });
});
