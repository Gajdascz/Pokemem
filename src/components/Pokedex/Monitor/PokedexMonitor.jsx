import PropTypes from "prop-types";

import PokedexOpenDisplay from "./PokedexOpenDisplay";
import PokedexMonitorFrame from "./PokedexMonitorFrame";
import styles from "./PokedexMonitor.module.css";

PokedexMonitor.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  closeRef: PropTypes.object,
  dexEntries: PropTypes.object,
};

export default function PokedexMonitor({
  isOpen,
  onClose,
  closeRef,
  dexEntries,
}) {
  const ViewWrapper = () => (
    <div
      className={`${styles.viewingContainer}`}
      onKeyDown={(e) => {
        if (e.key === "Tab") {
          e.preventDefault();
          closeRef.current?.focus();
        }
        if (e.key === "Escape") {
          e.preventDefault();
          onClose();
        }
      }}
      tabIndex="-1"
    >
      <div className={`${styles.viewingBackground}`}>
        <PokedexMonitorFrame
          isOpen={isOpen}
          display={
            <PokedexOpenDisplay
              onClose={(e) => onClose(e)}
              closeRef={closeRef}
              dexEntries={dexEntries}
            />
          }
        />
      </div>
    </div>
  );

  return (
    <>
      {isOpen ? (
        <ViewWrapper />
      ) : (
        <PokedexMonitorFrame
          isOpen={isOpen}
          display={
            <>
              <p className={styles.foundCount}>{dexEntries.found}</p>
              <p className={styles.totalCount}>{dexEntries.entries.length}</p>
            </>
          }
        />
      )}
    </>
  );
}
