import styles from './CardContainer.module.css';
import Loading from '../../Shared/Loading/Loading';
import Card from '../Card/Card';
import type { PokeApi } from '../../../core/PokeApi';

interface CardsDisplayProps {
  className?: string;
  onCardClick: (data: PokeApi.PokemonData) => void;
  cards: PokeApi.PokemonData[];
  loading: boolean;
  meta?: React.ReactNode;
}
export default function CardsDisplay({
  className,
  onCardClick,
  cards,
  loading,
  meta
}: CardsDisplayProps) {
  return (
    <div className={`${className ?? styles.container}`}>
      {meta && <div className={styles.metaWrapper}>{meta}</div>}
      {loading ?
        <Loading />
      : cards.map((card) => (
          <Card
            key={`pk-card-${card.id}`}
            {...card}
            onCardClick={onCardClick}
          />
        ))
      }
    </div>
  );
}
