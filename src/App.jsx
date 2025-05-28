import InfoPanel from './components/InfoPanel/InfoPanel';
import Footer from './components/Footer/Footer';
import Pokedex from './components/Pokedex/Pokedex';
import Stats from './components/Stats/Stats';
import CardContainer from './components/CardContainer/CardContainer';
import SaveInterface from './components/SaveInterface/SaveInterface';
import GameProvider from './contexts/game/GameProvider';
import styles from './styles/App.module.css';

import { useState, useEffect } from 'react';

const XWIDEWIDTH = 1024;
const WIDEWIDTH = 600;

function App() {
  const [dimensions, setDimensions] = useState({
    height: document.documentElement.scrollHeight,
    width: document.documentElement.scrollWidth
  });

  useEffect(() => {
    const handleResize = () => {
      const width = document.documentElement.scrollWidth;
      const height = document.documentElement.scrollHeight;
      setDimensions({ height, width });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const isXWide =
    dimensions.width > XWIDEWIDTH && dimensions.width > dimensions.height;
  const getWidthClass = () => {
    if (isXWide) return styles.xWide;
    return dimensions.width <= WIDEWIDTH ? styles.skinny : styles.wide;
  };
  const widthClass = getWidthClass();
  const getPokemonCardSize = () => {
    switch (widthClass) {
      case styles.xWide:
        return 'l';
      case styles.wide:
        return 'm';
      case styles.skinny:
        return 's';
    }
  };

  return (
    <GameProvider>
      <div className={`${styles.container} ${widthClass}`}>
        <InfoPanel
          headerText='Pokémem'
          className={`${styles.infoPanel} ${widthClass}`}
        >
          <div className={`${styles.infoPanelChildren} ${widthClass}`}>
            <Pokedex className={`${styles.pokedex} ${widthClass}`} />
            <Stats
              containerClass={`${styles.stats} ${widthClass}`}
              sectionsClass={`${styles.statsSections} ${widthClass}`}
            />
            <SaveInterface
              className={`${styles.saveInterface} ${widthClass}`}
            />
            {isXWide ?
              <Footer className={`${styles.footer} ${widthClass}`} />
            : null}
          </div>
        </InfoPanel>
        <CardContainer
          className={`${styles.cards} ${widthClass}`}
          PokemonCardSize={getPokemonCardSize()}
        />
        {!isXWide ?
          <Footer
            className={`${styles.footer} ${widthClass}`}
            copyrightOrientation={'horizontal'}
          />
        : null}
      </div>
    </GameProvider>
  );
}

export default App;
