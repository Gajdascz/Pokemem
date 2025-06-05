import { type PokedexProps, brightnessLevels } from '../types';
import styles from './Monitor.module.css';
import { clsx } from 'clsx';

interface MonitorProps extends PokedexProps {
  Screen?: React.ReactNode;
}

export default function Monitor({
  Screen,
  isOn,
  brightnessLevel,
  isOpen
}: MonitorProps) {
  return (
    <div
      className={clsx(styles.monitor, isOpen ? styles.dialog : styles.widget)}
    >
      <div className={styles.body}>
        <div className={styles.top}>
          {brightnessLevels.map((level) => (
            <span
              key={`pokedex-brightness-level-${level}`}
              className={clsx(
                styles.indicator,
                styles.brightnessIndicator,
                isOn && brightnessLevel === level && styles.on
              )}
            />
          ))}
        </div>
        <div className={styles.screenContainer}>{Screen}</div>
        <div className={styles.bottom}>
          <div
            className={clsx(
              styles.indicator,
              styles.screenIndicator,
              isOn && styles.on
            )}
          />
          <div className={styles.speaker}>
            <span className={styles.speakerSlit} />
            <span className={styles.speakerSlit} />
            <span className={styles.speakerSlit} />
            <span className={styles.speakerSlit} />
          </div>
        </div>
      </div>
    </div>
  );
}
