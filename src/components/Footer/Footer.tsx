import styles from './Footer.module.css';
import Icon from '../Shared/Icon/Icon';
import clsx from 'clsx';

export default function Footer() {
  return (
    <footer className={styles.container}>
      <div className={clsx(styles.copyright, styles.horizontal)}>
        <div className={styles.copyrightIconYear}>
          <Icon type='copyRight' className={styles.copyrightIcon} />
          <p className={styles.copyrightYear}>2025</p>
        </div>
        <p className={styles.author}>Nolan Gajdascz</p>
        <a
          href='https://github.com/Gajdascz/Pokemem'
          target='_blank'
          rel='noopener noreferrer'
          className={styles.button}
        >
          <Icon type='github' aria-hidden={true} tabIndex={-1} />
        </a>
      </div>
      <p className={styles.disclaimer}>
        Pokémon and Pokémon character names are trademarks of Nintendo.
      </p>
    </footer>
  );
}
