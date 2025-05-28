import PropTypes from "prop-types";
import { useContext } from "react";
import { GameContext } from "../../contexts/game/GameContext";
import styles from "./Card.module.css";

Card.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  name: PropTypes.string,
  type: PropTypes.string,
  img: PropTypes.string,
  size: PropTypes.oneOf(["s", "m", "l"]),
};

export default function Card({ id, name, type, img, size, ...rest }) {
  const { onCardClick } = useContext(GameContext);
  const capName = name.charAt(0).toUpperCase() + name.slice(1);

  return (
    <button
      className={`${styles.card} ${size === "l" ? styles.large : size === "m" ? styles.medium : styles.small}`}
      onClick={(e) => {
        onCardClick({ id, name });
        e.currentTarget.blur();
      }}
      {...rest}
    >
      <div
        className={styles.cardBody}
        style={{ backgroundColor: `var(--type-${type})` }}
      >
        <h3 className={styles.cardName}>{capName}</h3>
        <img src={img} alt={name} className={styles.cardImg} />
      </div>
    </button>
  );
}
