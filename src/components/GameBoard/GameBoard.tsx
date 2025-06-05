import type { Context } from '../../context/GameContext';

import CardContainer from './CardContainer/CardContainer';
import Pokedex from './Pokedex/Pokedex';
import Stats from './Stats/Stats';
import styles from './GameBoard.module.css';

export default function GameBoard({ loading, onCardClick, session }: Context) {
  return (
    <CardContainer
      cards={session.cards.activeSet}
      loading={loading}
      onCardClick={onCardClick}
      meta={
        <div className={styles.metaWrapper}>
          <Pokedex
            entries={session.pokedex.entries}
            found={session.pokedex.found}
          />
          <Stats
            highest={session.scores.highest}
            round={session.scores.running.round}
            score={session.scores.running.score}
          />
        </div>
      }
    />
  );
}
