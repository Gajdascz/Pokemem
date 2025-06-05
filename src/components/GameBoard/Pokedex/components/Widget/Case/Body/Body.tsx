import styles from './Body.module.css';

type CaseBody = React.HTMLAttributes<HTMLDivElement>;
export default function CaseBody({ children, ...rest }: CaseBody) {
  return (
    <div className={styles.body} {...rest}>
      {children}
    </div>
  );
}
