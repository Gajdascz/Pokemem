import styles from './Dropdown.module.css';

export interface DropdownContainerProps extends React.ComponentProps<'div'> {
  toggle?: React.ReactNode;
  children?: React.ReactNode;
  setOpen: (fn: (prev: boolean) => boolean) => void;
  open: boolean;
  topOffset?: string;
  rightOffset?: string;
  borderWidth?: string;
  borderRadius?: string;
}

export default function Dropdown({
  open,
  topOffset,
  rightOffset,
  borderRadius,
  borderWidth,
  children,
  toggle,
  setOpen,
  containerProps,
  style,
  ...rest
}: DropdownContainerProps & { containerProps?: React.ComponentProps<'div'> }) {
  const dropdownStyle = {
    top: topOffset,
    right: rightOffset,
    borderRadius: borderRadius,
    borderWidth: borderWidth,
    ...style
  };

  const dropdownClasses = [
    styles.dropdownContainer,
    open ? styles.open : styles.closed
  ].join(' ');

  return (
    <div {...containerProps}>
      <div
        className={styles.toggleButton}
        onClick={() => setOpen((prev: boolean) => !prev)}
        aria-expanded={open}
        aria-label='Toggle dropdown'
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen((prev: boolean) => !prev);
          }
        }}
      >
        {toggle ?? <p>Toggle</p>}
      </div>
      {children && (
        <div className={dropdownClasses} style={dropdownStyle} {...rest}>
          {children}
        </div>
      )}
    </div>
  );
}
