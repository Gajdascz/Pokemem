import styles from './Card.module.css';
import { capitalize } from '../../../core/utils';

interface PokemonCardProps {
  id: number;
  name: string;
  type: string;
  img: string;
  onCardClick: (card: {
    id: number;
    name: string;
    img: string;
    type: string;
  }) => void;
}
export default function Card({
  id,
  name,
  type,
  img,
  onCardClick,
  ...rest
}: PokemonCardProps) {
  return (
    <button
      className={styles.card}
      onClick={(e) => {
        onCardClick({ id, name, img, type });
        e.currentTarget.blur();
      }}
      {...rest}
    >
      <div
        className={styles.cardBody}
        style={{ backgroundColor: `var(--type-${type})` }}
      >
        <h3 className={styles.cardName}>{capitalize(name)}</h3>
        <img src={img} alt={name} className={styles.cardImg} />
      </div>
    </button>
  );
}
