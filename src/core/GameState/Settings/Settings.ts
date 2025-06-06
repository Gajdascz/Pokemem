import { Base } from '../Base';

/**
 * State shape for user settings.
 * - bgMusic: Whether background music is enabled.
 */
export interface SettingsState {
  bgMusic: boolean;
}

/**
 * Settings class manages user preferences, such as background music.
 */
export class Settings extends Base<SettingsState> {
  /**
   * Constructs a new Settings instance.
   * @param initial - Optional initial settings state.
   */
  constructor(initial?: SettingsState) {
    super(
      // Returns a new default settings state.
      (): SettingsState => ({ bgMusic: false }),
      // Validates the settings state shape and values.
      (settings: SettingsState) => {
        if (typeof settings.bgMusic !== 'boolean')
          throw new Error('Invalid bgMusic setting: must be a boolean');
      },
      initial
    );
  }

  /** Returns whether background music is enabled. */
  get bgMusic() {
    return this.state.bgMusic;
  }

  /**
   * Sets the background music setting.
   * @param value - True to enable, false to disable.
   * @returns The Settings instance for chaining.
   */
  setBgMusic(value: boolean) {
    this.set({ ...this.state, bgMusic: value });
    return this;
  }
}
