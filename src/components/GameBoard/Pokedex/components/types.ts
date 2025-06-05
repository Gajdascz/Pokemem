import type { Context } from '../../../../context/GameContext';
export const batteryLevels = ['low', 'medium', 'high'] as const;
export type BatteryLevel = (typeof batteryLevels)[number];
export const brightnessLevels = ['low', 'high'] as const;
export type BrightnessLevel = (typeof brightnessLevels)[number];
export type PokedexState = Context['session']['pokedex'];
export interface PokedexProps extends PokedexState {
  isOn: boolean;
  isOpen: boolean;
  batteryLevel: BatteryLevel;
  brightnessLevel: BrightnessLevel;
  powerToggle: () => void;
  openToggle: () => void;
}

export interface PokedexComponentProps extends PokedexState {
  batteryLevel?: BatteryLevel;
  brightnessLevel?: BrightnessLevel;
}
