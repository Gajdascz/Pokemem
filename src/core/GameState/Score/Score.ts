import { Base } from '../Base';

export interface ScoreState {
  running: { round: number; score: number };
  highest: { round: number; score: number };
}

export class Score extends Base<ScoreState> {
  constructor(initial?: ScoreState) {
    super(
      (): ScoreState => ({
        running: { round: 0, score: 0 },
        highest: { round: 0, score: 0 }
      }),
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
  resetRunning() {
    this.set({ ...this.state, running: { round: 0, score: 0 } });
    return this;
  }
  get running() {
    return this.state.running;
  }
  get highest() {
    return this.state.highest;
  }
}
