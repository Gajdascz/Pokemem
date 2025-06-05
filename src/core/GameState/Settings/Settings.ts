import { Base } from '../Base';

export interface SettingsState {
  bgMusic: boolean;
}

export class Settings extends Base<SettingsState> {
  constructor(initial?: SettingsState) {
    super(
      (): SettingsState => ({ bgMusic: false }),
      (settings: SettingsState) => {
        if (typeof settings.bgMusic !== 'boolean')
          throw new Error('Invalid bgMusic setting: must be a boolean');
      },
      initial
    );
  }
  get bgMusic() {
    return this.state.bgMusic;
  }
  setBgMusic(value: boolean) {
    this.set({ ...this.state, bgMusic: value });
    return this;
  }
}
