import clsx from 'clsx';
import type { PokedexProps } from '../types';
import styles from './Screen.module.css';
import Dialog from '../../../../Shared/Dialog/Dialog';

interface DialogProps {
  data: PokedexProps;
  Monitor: React.ComponentType<PokedexProps & { Screen: React.ReactNode }>;
}

export default function Screen({
  data: { entries, found, isOn, openToggle, ...rest },
  Monitor
}: DialogProps) {
  return (
    <Dialog>
      <Monitor
        entries={entries}
        found={found}
        isOn={isOn}
        openToggle={openToggle}
        {...rest}
        Screen={
          <div
            className={clsx(styles.screen, isOn ? styles.on : styles.off)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                openToggle();
              }
            }}
          >
            <div className={styles.contentContainer}>
              <div className={styles.headContainer}>
                <p className={styles.foundStats}>
                  {found} / {entries.length} (
                  {Math.round((found / entries.length) * 100) / 100}
                  %)
                </p>
                <button className={styles.closeButton} onClick={openToggle}>
                  X
                </button>
              </div>
              <div className={styles.entriesContainer}>
                {entries.map((entry, index) => (
                  <p
                    key={index + 1}
                    className={clsx(
                      entry.name ? styles.found : styles.notFound
                    )}
                  >
                    [{index + 1}] - {entry.name ?? '?????'}
                  </p>
                ))}
              </div>
            </div>
          </div>
        }
      />
    </Dialog>
  );
}
