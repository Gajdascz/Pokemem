import Header from './Header/Header';
import Footer from './Footer/Footer';
import GameBoard from './GameBoard/GameBoard';
import { useGameContext } from '../context/GameContext';
import styles from './Layout.module.css';

export default function Game() {
  const context = useGameContext();
  return (
    <div className={styles.layout}>
      <Header
        headerText='Pokémem'
        resetSave={context.startNewSession}
        {...context}
      />
      <GameBoard {...context} />
      <Footer />
    </div>
  );
}
