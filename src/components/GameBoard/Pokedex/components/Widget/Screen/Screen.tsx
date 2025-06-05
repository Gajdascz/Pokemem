import clsx from 'clsx';
import type { PokedexProps } from '../../../types';
import styles from './Screen.module.css';
export default function Screen({ entries, found, isOn }: PokedexProps) {
  return (
    <div className={`${styles.screen} ${isOn ? styles.on : styles.off}`}>
      <p className={styles.text}>{found}</p>
      <p className={clsx(styles.separatorLine, styles.text)} />
      <p className={styles.text}>{entries.length}</p>
    </div>
  );
}
