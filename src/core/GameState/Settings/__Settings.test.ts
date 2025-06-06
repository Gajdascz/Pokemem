import { describe, it, expect } from 'vitest';
import { Settings, type SettingsState } from './Settings';

describe('Settings', () => {
  it('should initialize with provided state', () => {
    const s = new Settings({ bgMusic: true });
    expect(s.bgMusic).toBe(true);
    expect(s.state.bgMusic).toBe(true);
  });

  it('should initialize with default state if no initial provided', () => {
    const s = new Settings();
    expect(s.bgMusic).toBe(false);
    expect(s.state.bgMusic).toBe(false);
  });

  it('should set bgMusic value', () => {
    const s = new Settings();
    s.setBgMusic(true);
    expect(s.bgMusic).toBe(true);
    s.setBgMusic(false);
    expect(s.bgMusic).toBe(false);
  });

  it('should throw if bgMusic is not a boolean', () => {
    expect(() => new Settings({ bgMusic: 1 as any })).toThrow(
      'Invalid bgMusic setting: must be a boolean'
    );
    expect(() => new Settings({ bgMusic: null as any })).toThrow(
      'Invalid bgMusic setting: must be a boolean'
    );
    expect(() => new Settings({ bgMusic: undefined as any })).toThrow(
      'Invalid bgMusic setting: must be a boolean'
    );
    expect(() => new Settings({ bgMusic: 'true' as any })).toThrow(
      'Invalid bgMusic setting: must be a boolean'
    );
  });

  it('should reset to default state', () => {
    const s = new Settings({ bgMusic: true });
    s.setBgMusic(false);
    s.reset();
    expect(s.bgMusic).toBe(false);
  });

  it('should import a valid state', () => {
    const s = new Settings();
    s.import({ bgMusic: true });
    expect(s.bgMusic).toBe(true);
  });

  it('should throw on import of invalid state', () => {
    const s = new Settings();
    expect(() => s.import({ bgMusic: 123 as any })).toThrow(
      'Invalid bgMusic setting: must be a boolean'
    );
  });
});
