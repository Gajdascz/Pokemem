import { useContext } from "react";
import { GameContext } from "../../contexts/game/GameContext";
import PropTypes from "prop-types";

import Icon from "../Icon/Icon";
import BackgroundMusic from "../BackgroundMusic/BackgroundMusic";
import Instructions from "../Instructions/Instructions";

import styles from "./InfoPanel.module.css";

InfoPanel.propTypes = {
  headerText: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string,
};

export default function InfoPanel({ headerText, children, className }) {
  const { bgMusic, setBgMusic } = useContext(GameContext);
  return (
    <header className={`${styles.container} ${className && ` ${className}`}`}>
      <div className={styles.headerTop}>
        <h1 className={styles.headerText}>{headerText}</h1>
        <div className={styles.buttonsContainer}>
          <button
            className={`${styles.button} ${bgMusic ? styles.on : styles.off}`}
            onClick={() => setBgMusic(!bgMusic)}
            aria-label="Toggle background music"
          >
            <Icon type="music" aria-hidden={true} />
            <BackgroundMusic src="./audio/bg_music_loop.mp3" playing={bgMusic} />
          </button>
          <Instructions buttonClass={styles.button} />
          <a
            href="https://github.com/Gajdascz/Pokemem"
            className="button"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button
              className={styles.button}
              aria-label="Open Github repository in a new tab"
            >
              <Icon type="gitHub" aria-hidden={true} />
            </button>
          </a>
        </div>
      </div>
      {children}
    </header>
  );
}
