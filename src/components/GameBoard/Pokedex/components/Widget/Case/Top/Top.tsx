import { capitalize } from '../../../../../../../core/utils';
import { type PokedexProps, batteryLevels } from '../../../types';
import { clsx } from 'clsx';
import styles from './Top.module.css';

export default function CaseTop({
  isOn,
  batteryLevel,
  powerToggle
}: PokedexProps) {
  return (
    <div className={styles.top}>
      <div className={styles.grooveOverlay} />
      <div className={styles.lightContainer}>
        <div className={clsx(styles.dexterLight, isOn && styles.active)} />
        <div className={styles.secondaryContainer}>
          <div className={styles.batteryIndicatorContainer}>
            {batteryLevels.map((level) => (
              <span
                key={`pokedex-battery-level-${level}`}
                className={clsx(
                  styles.batteryIndicator,
                  styles[`battery${capitalize(level)}`],
                  isOn && batteryLevel === level && styles.active
                )}
              />
            ))}
          </div>
          <button className={styles.powerButton} onClick={powerToggle}>
            power
          </button>
        </div>
      </div>
    </div>
  );
}
