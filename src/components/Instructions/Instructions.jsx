import PropTypes from "prop-types";
import Icon from "../Icon/Icon";
import styles from "./Instructions.module.css";
import { useRef, useState } from "react";

Instructions.propTypes = {
  buttonClass: PropTypes.string,
};

export default function Instructions({ buttonClass }) {
  const [isOpen, setIsOpen] = useState(false);
  const closeRef = useRef(null);

  const Popup = () => (
    <div
      className={styles.popupContainer}
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === "Tab") {
          e.preventDefault();
          closeRef.current.focus();
        }
      }}
    >
      <div
        className={`${styles.popup}`}
        style={{ display: isOpen ? "" : "none" }}
      >
        <div className={styles.popupHeader}>
          <h1 className={styles.popupHeaderText}>Instructions</h1>
          <button
            ref={closeRef}
            className={styles.popupCloseButton}
            onClick={() => setIsOpen(false)}
          >
            X
          </button>
        </div>

        <div className={styles.section}>
          <div className={styles.subsection}>
            <h2 className={styles.subsectionHeader}>How To Play</h2>
            <div className={styles.subsectionText}>
              <p>
                <strong>Objective:</strong> Click each displayed card once per
                round. Each successful click earns you one point.
              </p>
              <p>
                <strong>Progression:</strong> Clicking each card successfully in
                a round advances you to the next round.
              </p>
              <p>
                <strong>Penalty:</strong> Clicking the same card twice in one
                round resets your current score and round to zero. Your highest
                score and round are only tracked when you manually end your run.
                See rule below for details.
              </p>
              <p>
                <strong>Ending a Run:</strong> Click the &quot;End Run&quot;
                button to submit your score and round as your highest. Your
                highest score and round are only tracked when you end your run.
                Ending your run will reset your current score and round to zero.
              </p>
              <p>
                <strong>Round Details:</strong> Each round adds 2 more cards
                than the previous one. Starting from round 0 with 10 cards,
                round 1 has 12 cards, round 2 has 14, and so on.
              </p>
              <p>
                <strong>Pokedex:</strong> Discover new Pokémon by clicking on
                cards you&apos;ve never encountered before. Their names and IDs
                will be logged in the Pokedex, found in the info panel or
                sidebar, which displays the number of Pokémon found out of 1025.
                Click the Pokedex to view your entries.
              </p>
            </div>
          </div>

          <div className={styles.subsection}>
            <h2 className={styles.subsectionHeader}>Saves</h2>
            <div className={styles.subsectionText}>
              <p>
                <strong>Automatic Save:</strong> Progress is saved in your
                browser’s local storage when you press the &quot;End Run&quot;
                button.
              </p>
              <p>
                <strong>Manual Save:</strong> Click the &quot;Save&quot; button
                in the info panel to manually save and resume later from the
                exact point you left off.
              </p>
              <p>
                <strong>Export Save:</strong> After saving, an
                &quot;Export&quot; button will appear below &quot;Save&quot;,
                allowing you to download a .json file for future imports.
              </p>
              <p>
                <strong>Import Save:</strong> Click the &quot;Import&quot;
                button to select and load a saved file.
              </p>
              <p>
                <strong>Reset Progress:</strong> The &quot;Reset&quot; button
                clears local storage, deleting all saved progress.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  return (
    <div className={styles.instructions}>
      <button
        className={buttonClass}
        aria-label="Open Instructions"
        onClick={() => setIsOpen(true)}
      >
        <Icon type="questionMark" aria-hidden={true}></Icon>
      </button>
      {isOpen ? <Popup /> : null}
    </div>
  );
}
