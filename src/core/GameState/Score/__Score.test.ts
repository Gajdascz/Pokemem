import { describe, it, expect, beforeEach } from 'vitest';
import { Score, type ScoreState } from './Score';

describe('Score', () => {
  let score: Score;
  let initialState: ScoreState;

  beforeEach(() => {
    initialState = {
      running: { round: 2, score: 5 },
      highest: { round: 3, score: 8 }
    };
    score = new Score({ ...initialState });
  });

  it('should initialize with provided state', () => {
    expect(score.running).toEqual(initialState.running);
    expect(score.highest).toEqual(initialState.highest);
  });

  it('should initialize with default state if no initial provided', () => {
    const s = new Score();
    expect(s.running).toEqual({ round: 0, score: 0 });
    expect(s.highest).toEqual({ round: 0, score: 0 });
  });

  it('should increment running score and update highest if exceeded', () => {
    score.incrementScore();
    expect(score.running.score).toBe(6);
    expect(score.highest.score).toBe(8);

    // Increment until running.score > highest.score
    score.incrementScore();
    score.incrementScore();
    score.incrementScore();
    expect(score.running.score).toBe(9);
    expect(score.highest.score).toBe(9);
  });

  it('should increment running round and update highest if exceeded', () => {
    score.incrementRound();
    expect(score.running.round).toBe(3);
    expect(score.highest.round).toBe(3);

    // Increment until running.round > highest.round
    score.incrementRound();
    expect(score.running.round).toBe(4);
    expect(score.highest.round).toBe(4);
  });

  it('should reset running values to zero', () => {
    score.incrementScore();
    score.incrementRound();
    score.resetRunning();
    expect(score.running).toEqual({ round: 0, score: 0 });
  });

  it('should throw if running round is negative', () => {
    expect(
      () =>
        new Score({
          running: { round: -1, score: 0 },
          highest: { round: 0, score: 0 }
        })
    ).toThrow('Invalid running round: must be a non-negative number');
  });

  it('should throw if running score is negative', () => {
    expect(
      () =>
        new Score({
          running: { round: 0, score: -1 },
          highest: { round: 0, score: 0 }
        })
    ).toThrow('Invalid running score: must be a non-negative number');
  });

  it('should throw if highest round is negative', () => {
    expect(
      () =>
        new Score({
          running: { round: 0, score: 0 },
          highest: { round: -1, score: 0 }
        })
    ).toThrow('Invalid highest round: must be a non-negative number');
  });

  it('should throw if highest score is negative', () => {
    expect(
      () =>
        new Score({
          running: { round: 0, score: 0 },
          highest: { round: 0, score: -1 }
        })
    ).toThrow('Invalid highest score: must be a non-negative number');
  });

  it('should throw if running round exceeds highest round', () => {
    expect(
      () =>
        new Score({
          running: { round: 5, score: 0 },
          highest: { round: 3, score: 0 }
        })
    ).toThrow('Running round/score cannot exceed highest round/score');
  });

  it('should throw if running score exceeds highest score', () => {
    expect(
      () =>
        new Score({
          running: { round: 0, score: 10 },
          highest: { round: 0, score: 5 }
        })
    ).toThrow('Running round/score cannot exceed highest round/score');
  });

  it('should allow running values equal to highest values', () => {
    const s = new Score({
      running: { round: 3, score: 8 },
      highest: { round: 3, score: 8 }
    });
    expect(s.running).toEqual({ round: 3, score: 8 });
    expect(s.highest).toEqual({ round: 3, score: 8 });
  });
});
