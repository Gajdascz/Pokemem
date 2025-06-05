import { describe, it, expect, beforeEach } from 'vitest';
import { Settings } from './Settings';

describe('Settings', () => {
  let settings: Settings;

  beforeEach(() => {
    settings = new Settings();
  });

  describe('constructor', () => {
    it('should initialize with default values when no initial state provided', () => {
      const newSettings = new Settings();
      expect(newSettings.bgMusic).toBe(false);
    });

    it('should initialize with provided state - bgMusic true', () => {
      const initialState = { bgMusic: true };
      const newSettings = new Settings(initialState);
      expect(newSettings.bgMusic).toBe(true);
    });

    it('should initialize with provided state - bgMusic false', () => {
      const initialState = { bgMusic: false };
      const newSettings = new Settings(initialState);
      expect(newSettings.bgMusic).toBe(false);
    });

    it('should throw error when bgMusic is not a boolean - string', () => {
      const invalidState = { bgMusic: 'not-boolean' };
      expect(() => new Settings(invalidState as any)).toThrow(
        'Invalid bgMusic setting: must be a boolean'
      );
    });

    it('should throw error when bgMusic is not a boolean - number', () => {
      const invalidState = { bgMusic: 1 };
      expect(() => new Settings(invalidState as any)).toThrow(
        'Invalid bgMusic setting: must be a boolean'
      );
    });

    it('should throw error when bgMusic is not a boolean - null', () => {
      const invalidState = { bgMusic: null };
      expect(() => new Settings(invalidState as any)).toThrow(
        'Invalid bgMusic setting: must be a boolean'
      );
    });

    it('should throw error when bgMusic is not a boolean - undefined', () => {
      const invalidState = { bgMusic: undefined };
      expect(() => new Settings(invalidState as any)).toThrow(
        'Invalid bgMusic setting: must be a boolean'
      );
    });

    it('should throw error when bgMusic is not a boolean - object', () => {
      const invalidState = { bgMusic: {} };
      expect(() => new Settings(invalidState as any)).toThrow(
        'Invalid bgMusic setting: must be a boolean'
      );
    });

    it('should throw error when bgMusic is not a boolean - array', () => {
      const invalidState = { bgMusic: [] };
      expect(() => new Settings(invalidState as any)).toThrow(
        'Invalid bgMusic setting: must be a boolean'
      );
    });
  });

  describe('bgMusic getter', () => {
    it('should return default bgMusic value', () => {
      expect(settings.bgMusic).toBe(false);
    });

    it('should return correct bgMusic value when initialized with true', () => {
      const settingsWithTrue = new Settings({ bgMusic: true });
      expect(settingsWithTrue.bgMusic).toBe(true);
    });

    it('should return correct bgMusic value when initialized with false', () => {
      const settingsWithFalse = new Settings({ bgMusic: false });
      expect(settingsWithFalse.bgMusic).toBe(false);
    });
  });
  it('setBgMusic should update bgMusic state', () => {
    settings.setBgMusic(true);
    expect(settings.bgMusic).toBe(true);

    settings.setBgMusic(false);
    expect(settings.bgMusic).toBe(false);
  });
});
