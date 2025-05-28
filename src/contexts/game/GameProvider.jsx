import { useState, useEffect } from "react";

import { GameContext } from "./GameContext";
import { save, getSaveObj } from "../../apis/saveData";
import { fetchRandomPokemonData } from "../../apis/pokeAPI";

import PropTypes from "prop-types";

GameProvider.propTypes = {
  children: PropTypes.node,
  initialState: PropTypes.object,
};

export default function GameProvider({
  children,
  initialState = getSaveObj(),
}) {
  const [bgMusic, setBgMusic] = useState(initialState.settings.bgMusic);
  const [cards, setCards] = useState(initialState.session.cards);
  const [loading, setLoading] = useState(true);
  const [cardsImported, setCardsImported] = useState(
    initialState.session.cardsImported,
  );
  const [sessionId, setSessionId] = useState(initialState.session.id);
  const [runNumber, setRunNumber] = useState(initialState.session.runNumber);
  const [round, setRound] = useState(initialState.session.round);
  const [score, setScore] = useState(initialState.session.score);
  const [clicked, setClicked] = useState(initialState.session.clicked);
  const [highest, setHighest] = useState(initialState.progress.highest);
  const [dexEntries, setDexEntries] = useState(
    initialState.progress.dexEntries,
  );

  useEffect(() => {
    if (cardsImported) {
      setLoading(false);
      return;
    }
    const fetch = async () => {
      setLoading(true);
      try {
        const response = await fetchRandomPokemonData(10 + round * 2);
        setCards(response);
      } catch (error) {
        console.error(`Failed to fetch cards: ${error}`);
      }
      setLoading(false);
    };
    fetch();
    setClicked(new Set());
  }, [round, runNumber, sessionId, cardsImported]);

  const syncState = () => {
    const { settings, session, progress } = getSaveObj();
    setBgMusic(settings.bgMusic);
    setCards(session.cards);
    setCardsImported(session.cardsImported);
    setSessionId(session.id);
    setRunNumber(session.runNumber);
    setRound(session.round);
    setScore(session.score);
    setClicked(session.clicked);
    setHighest(progress.highest);
    setDexEntries(progress.dexEntries);
  };

  const getCurrentGameData = () => ({
    settings: {
      bgMusic,
    },
    session: {
      id: sessionId,
      runNumber,
      score,
      round,
      cards: score > 0 ? cards : [],
      clicked: score > 0 ? Array.from(clicked) : [],
    },
    progress: {
      highest,
      dexEntries,
    },
  });

  const shuffleCards = () => {
    setCards((current) => {
      const cards = [...current];
      for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
      }
      return cards;
    });
  };

  const addDexEntry = (id, name) => {
    setDexEntries((prevDexEntries) => {
      const newEntries = [...prevDexEntries.entries];
      newEntries[id] = { ...newEntries[id], name: name };
      return {
        found: prevDexEntries.found + 1,
        entries: newEntries,
      };
    });
  };

  const startNewRun = () => {
    setScore(0);
    setRound(0);
    setRunNumber((prev) => prev + 1);
    setCardsImported(false);
  };

  const onCardClick = (cardData) => {
    const { id, name } = cardData;
    if (clicked.has(id)) {
      startNewRun();
      return;
    }
    setScore((prevScore) => prevScore + 1);
    if (dexEntries.entries[id].name === null) addDexEntry(id, name);
    const newClicked = new Set(clicked).add(id);
    if (newClicked.size === cards.length) {
      setRound((prevRound) => prevRound + 1);
      setCardsImported(false);
      return;
    }
    setClicked(new Set(clicked).add(id));
    shuffleCards();
  };

  const onEndRun = () => {
    setHighest({
      ...highest,
      ...(highest.score < score && { score: score, round: round }),
    });
    save(getCurrentGameData());
    startNewRun();
  };

  const value = {
    loading,
    bgMusic,
    setBgMusic,
    score,
    round,
    highest,
    dexEntries,
    cards,
    onCardClick,
    onEndRun,
    syncState,
    getCurrentGameData,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
