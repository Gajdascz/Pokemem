import Icon from '../../Shared/Icon/Icon';
import styles from './Instructions.module.css';
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Dialog from '../../Shared/Dialog/Dialog';
import { INFO } from './info';

interface InstructionsProps {
  buttonClass?: string;
}
export default function Instructions({ buttonClass }: InstructionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button
        className={buttonClass}
        aria-label='Open Instructions'
        onClick={() => setIsOpen(true)}
      >
        <Icon type='questionMark' aria-hidden={true} tabIndex={-1}></Icon>
      </button>
      {isOpen ?
        createPortal(
          <Dialog>
            <div className={`${styles.popup}`}>
              <div className={styles.popupHeader}>
                <h1 className={styles.popupHeaderText}>{INFO.title}</h1>
                <button
                  className={styles.popupCloseButton}
                  onClick={() => setIsOpen(false)}
                >
                  X
                </button>
              </div>
              <div className={styles.sectionsContainer}>
                {INFO.sections.map((section, index) => (
                  <p
                    className={styles.section}
                    key={`instructions-section-${index}`}
                  >
                    <span className={styles.tag}>{section.tag}:</span>{' '}
                    {section.text}
                  </p>
                ))}
              </div>
            </div>
          </Dialog>,
          document.body
        )
      : null}
    </>
  );
}
