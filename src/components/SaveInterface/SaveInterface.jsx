import PropTypes from "prop-types";
import { useEffect, useRef, useState, useContext } from "react";
import { GameContext } from "../../contexts/game/GameContext";
import styles from "./SaveInterface.module.css";
import {
  save,
  importSave,
  clearSave,
  getSaveStr,
  sub,
  unsub,
} from "../../apis/saveData";

SaveInterface.propTypes = {
  className: PropTypes.string,
};

export default function SaveInterface({ className }) {
  const { getCurrentGameData, syncState } = useContext(GameContext);
  const downloadRef = useRef();
  const [data, setData] = useState(getSaveStr());

  useEffect(() => {
    sub(setData);
    return () => unsub(setData);
  }, []);

  useEffect(() => {
    let url;
    if (data && data.length > 0) {
      const blob = new Blob([data], { type: "application/json" });
      url = URL.createObjectURL(blob);
      downloadRef.current.href = url;
      downloadRef.current.download = `save.json`;
    }
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [data]);

  return (
    <div className={`${styles.container}${className && ` ${className}`}`}>
      <button
        className={styles.button}
        onClick={() => save(getCurrentGameData())}
      >
        Save
      </button>

      {data && data.length > 0 && (
        <a className={styles.button} ref={downloadRef}>
          Export
        </a>
      )}
      <label className={styles.button} htmlFor="save-import">
        Import
        <input
          id="save-import"
          type="file"
          onChange={async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            try {
              await importSave(file);
              syncState();
            } catch (error) {
              console.error("Error importing file:", error);
            }
          }}
          accept=".json"
        />
      </label>
      <button
        className={`${styles.button} ${styles.resetButton}`}
        onClick={() => {
          clearSave();
          syncState();
        }}
      >
        Reset
      </button>
    </div>
  );
}
