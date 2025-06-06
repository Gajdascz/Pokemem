import { Base } from '../Base';

/**
 * State shape for tracking scores.
 * - running: The current round and score in progress.
 * - highest: The highest round and score achieved.
 */
export interface ScoreState {
  running: { round: number; score: number };
  highest: { round: number; score: number };
}

/**
 * Score class manages the current and highest scores and rounds.
 * Provides methods to increment scores/rounds and reset the running state.
 */
export class Score extends Base<ScoreState> {
  /**
   * Constructs a new Score instance.
   * @param initial - Optional initial score state.
   */
  constructor(initial?: ScoreState) {
    super(
      // Returns a new default score state.
      (): ScoreState => ({
        running: { round: 0, score: 0 },
        highest: { round: 0, score: 0 }
      }),
      // Validates the score state shape and values.
      (state: ScoreState) => {
        if (typeof state.running.round !== 'number' || state.running.round < 0)
          throw new Error(
            'Invalid running round: must be a non-negative number'
          );
        if (typeof state.running.score !== 'number' || state.running.score < 0)
          throw new Error(
            'Invalid running score: must be a non-negative number'
          );
        if (typeof state.highest.round !== 'number' || state.highest.round < 0)
          throw new Error(
            'Invalid highest round: must be a non-negative number'
          );
        if (typeof state.highest.score !== 'number' || state.highest.score < 0)
          throw new Error(
            'Invalid highest score: must be a non-negative number'
          );
        if (
          state.running.round > state.highest.round
          || state.running.score > state.highest.score
        ) {
          throw new Error(
            'Running round/score cannot exceed highest round/score'
          );
        }
      },
      initial
    );
  }

  /**
   * Increments the running score.
   * Updates the highest score if the new running score exceeds it.
   * @returns The Score instance for chaining.
   */
  incrementScore() {
    const next = this.state.running.score + 1;
    if (next <= this.state.highest.score) {
      this.set({
        ...this.state,
        running: { ...this.state.running, score: next }
      });
    } else {
      this.set({
        running: { round: this.state.running.round, score: next },
        highest: { round: this.state.highest.round, score: next }
      });
    }
    return this;
  }

  /**
   * Increments the running round.
   * Updates the highest round if the new running round exceeds it.
   * @returns The Score instance for chaining.
   */
  incrementRound() {
    const next = this.state.running.round + 1;
    if (next <= this.state.highest.round) {
      this.set({
        ...this.state,
        running: { ...this.state.running, round: next }
      });
    } else {
      this.set({
        running: { score: this.state.running.score, round: next },
        highest: { score: this.state.highest.score, round: next }
      });
    }
    return this;
  }

  /**
   * Resets the running score and round to zero.
   * @returns The Score instance for chaining.
   */
  resetRunning() {
    this.set({ ...this.state, running: { round: 0, score: 0 } });
    return this;
  }

  /** Returns the current running score and round. */
  get running() {
    return this.state.running;
  }

  /** Returns the highest score and round achieved. */
  get highest() {
    return this.state.highest;
  }
}
