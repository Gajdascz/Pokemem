import type React from 'react';
import styles from './Dialog.module.css';

export default function Dialog({
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={styles.dialogOverlay}>
      <div className={styles.dialog} {...rest}>
        {children}
      </div>
    </div>
  );
}
