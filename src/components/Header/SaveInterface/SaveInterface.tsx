import styles from './SaveInterface.module.css';
import Dialog from '../../Shared/Dialog/Dialog';
import Icon from '../../Shared/Icon/Icon';
import { createPortal } from 'react-dom';
import { useState } from 'react';

interface SaveInterfaceProps {
  buttonClass?: string;

  importSave: (file: File) => Promise<void>;
  exportSave: () => void;
  resetSave: () => Promise<void>;
}
export default function SaveInterface({
  buttonClass,
  resetSave,
  exportSave,
  importSave
}: SaveInterfaceProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button className={buttonClass} onClick={() => setIsOpen(true)}>
        <Icon type='save' aria-hidden={true} tabIndex={-1} />
      </button>
      {isOpen ?
        createPortal(
          <Dialog>
            <div className={styles.container}>
              <div className={styles.header}>
                <h1 className={styles.headerText}>Save Data</h1>
                <button
                  className={styles.closeButton}
                  onClick={() => setIsOpen(false)}
                >
                  X
                </button>
              </div>
              <div className={styles.buttonsContainer}>
                <button className={styles.button} onClick={exportSave}>
                  Export
                </button>
                <label className={styles.button} htmlFor='import-save-data'>
                  Import
                  <input
                    id='import-save-data'
                    type='file'
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file)
                        importSave(file).then(
                          () => true,
                          (error: unknown) => {
                            if (error instanceof Error) throw error;
                            if (typeof error === 'string')
                              throw new Error(error);
                            throw new Error(`Failed to import save data`);
                          }
                        );
                    }}
                    accept='.json'
                  />
                </label>
                <button
                  className={`${styles.button} ${styles.resetButton}`}
                  onClick={async () => {
                    await resetSave();
                    setIsOpen(false);
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          </Dialog>,
          document.body
        )
      : null}
    </>
  );
}
