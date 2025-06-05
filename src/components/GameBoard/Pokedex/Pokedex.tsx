import styles from './Pokedex.module.css';
import { useState } from 'react';
import {
  Widget,
  Dialog,
  Monitor,
  type PokedexComponentProps
} from './components/index';

export default function Pokedex({
  batteryLevel = 'high',
  brightnessLevel = 'high',
  entries,
  found
}: PokedexComponentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isOn, setIsOn] = useState(true);
  const powerToggle = () => setIsOn(!isOn);
  const openToggle = () => setIsOpen(!isOpen);
  const data = {
    entries,
    found,
    batteryLevel,
    brightnessLevel,
    isOpen,
    isOn,
    powerToggle,
    openToggle
  } as const;
  return (
    <div className={styles.pokedexTheme}>
      {isOpen ?
        <Dialog Monitor={Monitor} data={data} />
      : <Widget Monitor={Monitor} data={data} />}
    </div>
  );
}
