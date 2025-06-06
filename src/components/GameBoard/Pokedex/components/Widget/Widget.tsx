import styles from './Widget.module.css';
import type { PokedexProps } from '../types';
import Case from './Case/Case';
import Screen from './Screen/Screen';
import clsx from 'clsx';

interface WidgetProps {
  data: PokedexProps;
  Monitor: React.ComponentType<PokedexProps & { Screen: React.ReactNode }>;
}
export default function Widget({
  data: { isOn = true, ...rest },
  Monitor
}: WidgetProps) {
  return (
    <Case isOn={isOn} {...rest}>
      <div
        className={clsx(styles.interactiveWidget, isOn && styles.on)}
        {...(isOn && { onClick: rest.openToggle })}
      >
        <Monitor
          {...rest}
          isOn={isOn}
          Screen={<Screen isOn={isOn} {...rest} />}
        />
      </div>
    </Case>
  );
}
