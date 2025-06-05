import { describe, it, expect, beforeEach } from 'vitest';
import { Score } from './Score';

describe('Score', () => {
  let score: Score;

  beforeEach(() => {
    score = new Score();
  });

  describe('constructor', () => {
    it('should initialize with default values when no initial state provided', () => {
      const newScore = new Score();
      expect(newScore.running).toEqual({ round: 0, score: 0 });
      expect(newScore.highest).toEqual({ round: 0, score: 0 });
    });

    it('should initialize with provided state', () => {
      const initialState = {
        running: { round: 2, score: 5 },
        highest: { round: 3, score: 8 }
      };
      const newScore = new Score(initialState);
      expect(newScore.running).toEqual({ round: 2, score: 5 });
      expect(newScore.highest).toEqual({ round: 3, score: 8 });
    });

    it('should throw error when running round is not a number', () => {
      const invalidState = {
        running: { round: 'not-number', score: 0 },
        highest: { round: 0, score: 0 }
      };
      expect(() => new Score(invalidState as any)).toThrow(
        'Invalid running round: must be a non-negative number'
      );
    });

    it('should throw error when running round is negative', () => {
      const invalidState = {
        running: { round: -1, score: 0 },
        highest: { round: 0, score: 0 }
      };
      expect(() => new Score(invalidState)).toThrow(
        'Invalid running round: must be a non-negative number'
      );
    });

    it('should throw error when running score is not a number', () => {
      const invalidState = {
        running: { round: 0, score: 'not-number' },
        highest: { round: 0, score: 0 }
      };
      expect(() => new Score(invalidState as any)).toThrow(
        'Invalid running score: must be a non-negative number'
      );
    });

    it('should throw error when running score is negative', () => {
      const invalidState = {
        running: { round: 0, score: -1 },
        highest: { round: 0, score: 0 }
      };
      expect(() => new Score(invalidState)).toThrow(
        'Invalid running score: must be a non-negative number'
      );
    });

    it('should throw error when highest round is not a number', () => {
      const invalidState = {
        running: { round: 0, score: 0 },
        highest: { round: 'not-number', score: 0 }
      };
      expect(() => new Score(invalidState as any)).toThrow(
        'Invalid highest round: must be a non-negative number'
      );
    });

    it('should throw error when highest round is negative', () => {
      const invalidState = {
        running: { round: 0, score: 0 },
        highest: { round: -1, score: 0 }
      };
      expect(() => new Score(invalidState)).toThrow(
        'Invalid highest round: must be a non-negative number'
      );
    });

    it('should throw error when highest score is not a number', () => {
      const invalidState = {
        running: { round: 0, score: 0 },
        highest: { round: 0, score: 'not-number' }
      };
      expect(() => new Score(invalidState as any)).toThrow(
        'Invalid highest score: must be a non-negative number'
      );
    });

    it('should throw error when highest score is negative', () => {
      const invalidState = {
        running: { round: 0, score: 0 },
        highest: { round: 0, score: -1 }
      };
      expect(() => new Score(invalidState)).toThrow(
        'Invalid highest score: must be a non-negative number'
      );
    });

    it('should throw error when running round exceeds highest round', () => {
      const invalidState = {
        running: { round: 5, score: 0 },
        highest: { round: 3, score: 0 }
      };
      expect(() => new Score(invalidState)).toThrow(
        'Running round/score cannot exceed highest round/score'
      );
    });

    it('should throw error when running score exceeds highest score', () => {
      const invalidState = {
        running: { round: 0, score: 10 },
        highest: { round: 0, score: 5 }
      };
      expect(() => new Score(invalidState)).toThrow(
        'Running round/score cannot exceed highest round/score'
      );
    });

    it('should allow running values equal to highest values', () => {
      const validState = {
        running: { round: 5, score: 10 },
        highest: { round: 5, score: 10 }
      };
      const newScore = new Score(validState);
      expect(newScore.running).toEqual({ round: 5, score: 10 });
      expect(newScore.highest).toEqual({ round: 5, score: 10 });
    });
  });

  describe('incrementScore', () => {
    it('should increment running score without updating highest when below highest', () => {
      const initialState = {
        running: { round: 1, score: 2 },
        highest: { round: 5, score: 10 }
      };
      const scoreInstance = new Score(initialState);

      const result = scoreInstance.incrementScore();

      expect(result).toBe(scoreInstance); // Returns this for chaining
      expect(scoreInstance.running).toEqual({ round: 1, score: 3 });
      expect(scoreInstance.highest).toEqual({ round: 5, score: 10 });
    });

    it('should increment running score and update highest when exceeding highest', () => {
      const initialState = {
        running: { round: 2, score: 5 },
        highest: { round: 3, score: 5 }
      };
      const scoreInstance = new Score(initialState);

      scoreInstance.incrementScore();

      expect(scoreInstance.running).toEqual({ round: 2, score: 6 });
      expect(scoreInstance.highest).toEqual({ round: 3, score: 6 });
    });

    it('should increment from zero', () => {
      score.incrementScore();

      expect(score.running).toEqual({ round: 0, score: 1 });
      expect(score.highest).toEqual({ round: 0, score: 1 });
    });

    it('should handle multiple increments', () => {
      score.incrementScore();
      score.incrementScore();
      score.incrementScore();

      expect(score.running).toEqual({ round: 0, score: 3 });
      expect(score.highest).toEqual({ round: 0, score: 3 });
    });

    it('should maintain highest round when updating highest score', () => {
      const initialState = {
        running: { round: 1, score: 5 },
        highest: { round: 10, score: 5 }
      };
      const scoreInstance = new Score(initialState);

      scoreInstance.incrementScore();

      expect(scoreInstance.running).toEqual({ round: 1, score: 6 });
      expect(scoreInstance.highest).toEqual({ round: 10, score: 6 });
    });
  });

  describe('incrementRound', () => {
    it('should increment running round without updating highest when below highest', () => {
      const initialState = {
        running: { round: 2, score: 5 },
        highest: { round: 10, score: 8 }
      };
      const scoreInstance = new Score(initialState);

      const result = scoreInstance.incrementRound();

      expect(result).toBe(scoreInstance); // Returns this for chaining
      expect(scoreInstance.running).toEqual({ round: 3, score: 5 });
      expect(scoreInstance.highest).toEqual({ round: 10, score: 8 });
    });

    it('should increment running round and update highest when exceeding highest', () => {
      const initialState = {
        running: { round: 5, score: 3 },
        highest: { round: 5, score: 8 }
      };
      const scoreInstance = new Score(initialState);

      scoreInstance.incrementRound();

      expect(scoreInstance.running).toEqual({ round: 6, score: 3 });
      expect(scoreInstance.highest).toEqual({ round: 6, score: 8 });
    });

    it('should increment from zero', () => {
      score.incrementRound();

      expect(score.running).toEqual({ round: 1, score: 0 });
      expect(score.highest).toEqual({ round: 1, score: 0 });
    });

    it('should handle multiple increments', () => {
      score.incrementRound();
      score.incrementRound();
      score.incrementRound();

      expect(score.running).toEqual({ round: 3, score: 0 });
      expect(score.highest).toEqual({ round: 3, score: 0 });
    });

    it('should maintain highest score when updating highest round', () => {
      const initialState = {
        running: { round: 5, score: 2 },
        highest: { round: 5, score: 15 }
      };
      const scoreInstance = new Score(initialState);

      scoreInstance.incrementRound();

      expect(scoreInstance.running).toEqual({ round: 6, score: 2 });
      expect(scoreInstance.highest).toEqual({ round: 6, score: 15 });
    });
  });

  describe('resetRunning', () => {
    it('should reset running values to zero while preserving highest', () => {
      const initialState = {
        running: { round: 5, score: 10 },
        highest: { round: 8, score: 15 }
      };
      const scoreInstance = new Score(initialState);

      const result = scoreInstance.resetRunning();

      expect(result).toBe(scoreInstance); // Returns this for chaining
      expect(scoreInstance.running).toEqual({ round: 0, score: 0 });
      expect(scoreInstance.highest).toEqual({ round: 8, score: 15 });
    });

    it('should reset running values when they equal highest', () => {
      const initialState = {
        running: { round: 5, score: 10 },
        highest: { round: 5, score: 10 }
      };
      const scoreInstance = new Score(initialState);

      scoreInstance.resetRunning();

      expect(scoreInstance.running).toEqual({ round: 0, score: 0 });
      expect(scoreInstance.highest).toEqual({ round: 5, score: 10 });
    });

    it('should work on already reset state', () => {
      score.resetRunning();

      expect(score.running).toEqual({ round: 0, score: 0 });
      expect(score.highest).toEqual({ round: 0, score: 0 });
    });
  });

  describe('getters', () => {
    it('should return cloned running object', () => {
      const initialState = {
        running: { round: 3, score: 7 },
        highest: { round: 5, score: 10 }
      };
      const scoreInstance = new Score(initialState);

      const running1 = scoreInstance.running;
      const running2 = scoreInstance.running;

      expect(running1).toEqual({ round: 3, score: 7 });
      expect(running1).toEqual(running2);
      expect(running1).not.toBe(running2); // Different references

      // Modifying returned object should not affect internal state
      running1.round = 999;
      expect(scoreInstance.running.round).toBe(3);
    });

    it('should return cloned highest object', () => {
      const initialState = {
        running: { round: 3, score: 7 },
        highest: { round: 5, score: 10 }
      };
      const scoreInstance = new Score(initialState);

      const highest1 = scoreInstance.highest;
      const highest2 = scoreInstance.highest;

      expect(highest1).toEqual({ round: 5, score: 10 });
      expect(highest1).toEqual(highest2);
      expect(highest1).not.toBe(highest2); // Different references

      // Modifying returned object should not affect internal state
      highest1.score = 999;
      expect(scoreInstance.highest.score).toBe(10);
    });
  });

  describe('method chaining', () => {
    it('should allow chaining incrementScore calls', () => {
      const result = score.incrementScore().incrementScore().incrementScore();

      expect(result).toBe(score);
      expect(score.running).toEqual({ round: 0, score: 3 });
      expect(score.highest).toEqual({ round: 0, score: 3 });
    });

    it('should allow chaining incrementRound calls', () => {
      const result = score.incrementRound().incrementRound();

      expect(result).toBe(score);
      expect(score.running).toEqual({ round: 2, score: 0 });
      expect(score.highest).toEqual({ round: 2, score: 0 });
    });

    it('should allow chaining mixed method calls', () => {
      const result = score
        .incrementScore()
        .incrementRound()
        .incrementScore()
        .resetRunning();

      expect(result).toBe(score);
      expect(score.running).toEqual({ round: 0, score: 0 });
      expect(score.highest).toEqual({ round: 1, score: 2 });
    });
  });

  describe('edge cases and integration', () => {
    it('should handle complex score progression scenario', () => {
      score
        .incrementScore() // running: {0,1}, highest: {0,1}
        .incrementScore() // running: {0,2}, highest: {0,2}
        .incrementRound() // running: {1,2}, highest: {1,2}
        .incrementScore() // running: {1,3}, highest: {1,3}
        .resetRunning(); // running: {0,0}, highest: {1,3}

      expect(score.running).toEqual({ round: 0, score: 0 });
      expect(score.highest).toEqual({ round: 1, score: 3 });

      // Continue from reset
      score.incrementScore(); // running: {0,1}, highest: {1,3} (no change to highest)

      expect(score.running).toEqual({ round: 0, score: 1 });
      expect(score.highest).toEqual({ round: 1, score: 3 });
    });

    it('should maintain state consistency with large numbers', () => {
      const largeState = {
        running: { round: 100, score: 1000 },
        highest: { round: 150, score: 2000 }
      };
      const scoreInstance = new Score(largeState);

      scoreInstance.incrementScore().incrementRound();

      expect(scoreInstance.running).toEqual({ round: 101, score: 1001 });
      expect(scoreInstance.highest).toEqual({ round: 150, score: 2000 });
    });

    it('should handle reaching new highest in both round and score simultaneously', () => {
      const initialState = {
        running: { round: 5, score: 10 },
        highest: { round: 5, score: 10 }
      };
      const scoreInstance = new Score(initialState);

      scoreInstance.incrementRound().incrementScore();

      expect(scoreInstance.running).toEqual({ round: 6, score: 11 });
      expect(scoreInstance.highest).toEqual({ round: 6, score: 11 });
    });
  });
});
