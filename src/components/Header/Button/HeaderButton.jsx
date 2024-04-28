import PropTypes from "prop-types";
import styles from "./HeaderButton.module.css";

HeaderButton.propTypes = {
  className: PropTypes.string,
  isToggle: PropTypes.bool,
  isActive: PropTypes.bool,
  children: PropTypes.node,
};

export default function HeaderButton({
  className,
  isToggle,
  isActive = null,
  children,
  ...rest
} = {}) {
  const btnClass = [styles.button, className, isToggle && (isActive ? styles.on : styles.off)]
    .filter(Boolean)
    .join(" ");
  return (
    <button className={btnClass} aria-pressed={isToggle && isActive} {...rest}>
      {children}
    </button>
  );
}
