import CaseTop from './Top/Top';
import CaseBody from './Body/Body';
import styles from './Case.module.css';
import type { PokedexProps } from '../../types';

export default function Case({
  children,
  ...rest
}: PokedexProps & { children?: React.ReactNode }) {
  return (
    <div className={styles.case}>
      <CaseTop {...rest} />
      <CaseBody>{children}</CaseBody>
    </div>
  );
}
