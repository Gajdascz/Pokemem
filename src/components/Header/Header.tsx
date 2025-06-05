import type { Context } from '../../context/GameContext';
import Icon from '../Shared/Icon/Icon';
import Audio from './Audio/Audio';
import Instructions from './Instructions/Instructions';
import Dropdown from '../Shared/Dropdown/Dropdown';
import SaveInterface from './SaveInterface/SaveInterface';
import styles from './Header.module.css';
import { useState } from 'react';
import clsx from 'clsx';

interface HeaderProps {
  headerText: string;
  session: Context['session'];
  exportSave: Context['exportSave'];
  loadSave: Context['loadSave'];
  resetSave: Context['startNewSession'];
  setBgMusic: Context['setBgMusic'];

  className?: string;
}

export default function Header({
  headerText,
  className,
  session,
  setBgMusic,
  exportSave,
  loadSave,
  resetSave
}: HeaderProps) {
  const { bgMusic } = session.settings;
  const [open, setOpen] = useState(false);
  return (
    <header className={clsx(styles.container, className)}>
      <h1 className={styles.headerText}>{headerText}</h1>
      <Dropdown
        topOffset='3.5rem'
        rightOffset='0.5rem'
        borderRadius='0.5rem'
        open={open}
        setOpen={setOpen}
        toggle={
          <button
            className={clsx(
              styles['menu-toggle-button'],
              open && styles.active
            )}
          >
            <Icon type='cog' aria-hidden={true} />
          </button>
        }
      >
        <button
          className={`${styles.button} ${bgMusic ? styles.on : styles.off}`}
          onClick={() => setBgMusic(!bgMusic)}
          aria-label='Toggle background music'
          aria-pressed={bgMusic}
        >
          <Icon type='music' aria-hidden={true} tabIndex={-1} />
          <Audio
            src='./audio/bg_music_loop.mp3'
            playing={bgMusic}
            tabIndex={-1}
          />
        </button>
        <Instructions buttonClass={styles.button} />
        <SaveInterface
          buttonClass={styles.button}
          resetSave={resetSave}
          exportSave={exportSave}
          importSave={loadSave}
        />
      </Dropdown>
    </header>
  );
}
