import PropTypes from 'prop-types';
import styles from './CardContainer.module.css';
import Loading from '../Loading/Loading';
import Card from '../Card/Card';
import { useContext } from 'react';
import { GameContext } from '../../contexts/game/GameContext';
CardsDisplay.propTypes = {
  className: PropTypes.string,
  PokemonCardSize: PropTypes.oneOf(['s', 'm', 'l'])
};
export default function CardsDisplay({ className, PokemonCardSize }) {
  const { loading, cards } = useContext(GameContext);
  return (
    <div className={`${className ? className : styles.container}`}>
      {loading ?
        <Loading />
      : cards.map((card) => (
          <Card key={card.id} {...card} size={PokemonCardSize} />
        ))
      }
    </div>
  );
}
