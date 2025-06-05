import styles from './Stats.module.css';

interface StatsProps {
  score: number;
  round: number;
  highest: { score: number; round: number };
}
export default function Stats({ highest, round, score }: StatsProps) {
  return (
    <div className={styles.container}>
      <div className={styles.sections}>
        <div className={styles.section}>
          <h3 className={styles.sectionHeader}>Current</h3>
          <p className={styles.statWrapper}>
            <span className={styles.statName}>score:</span>
            <span className={styles.statNumber}>{score}</span>
          </p>
          <p className={styles.statWrapper}>
            <span className={styles.statName}>round:</span>
            <span className={styles.statNumber}>{round}</span>
          </p>
        </div>
        <div className={styles.section}>
          <h3 className={styles.sectionHeader}>Highest</h3>
          <p className={styles.statWrapper}>
            <span className={styles.statName}>score:</span>
            <span className={styles.statNumber}>{highest.score}</span>
          </p>
          <p className={styles.statWrapper}>
            <span className={styles.statName}>round:</span>
            <span className={styles.statNumber}>{highest.round}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
