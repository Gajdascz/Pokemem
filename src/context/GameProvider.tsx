import { useState, useEffect, useRef, useMemo } from 'react';
import { GameContext } from './GameContext';
import { GameController, type Session } from '../core/GameController';

interface GameProviderProps {
  children: React.ReactNode;
  baseCardCount?: number;
  initialSession?: Session;
}

/**
 * GameProvider sets up and provides the game controller and session state
 * to the React context for use throughout the app.
 * Handles controller lifecycle, session sync, and loading state.
 */
export default function GameProvider({
  children,
  baseCardCount = 2,
  initialSession
}: GameProviderProps) {
  // Persist the GameController instance across renders.
  const controllerRef = useRef<GameController>(null);
  controllerRef.current ??= new GameController({
    baseCardCount,
    initialSession
  });

  const controller = controllerRef.current;

  // Local state for loading indicator and session snapshot.
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<Session>(controller.session);

  useEffect(() => {
    // Save session on page unload.
    const saveOnUnload = () => controller.save();
    window.addEventListener('beforeunload', saveOnUnload);

    // Subscribe to loading events and session sync.
    const startedLoadingSub = controller.onLoading('startedLoading', () =>
      setLoading(true)
    );
    const doneLoadingSub = controller.onLoading('doneLoading', () =>
      setLoading(false)
    );
    const syncSub = controller.onSync(setSession);

    // If no cards are loaded, start a new run.
    if (!(controller.session.cards.activeSet.length > 0))
      controller
        .startNewRun()
        .then(() => {
          setSession(controller.session);
          setLoading(false);
        })
        .catch((error: unknown) => {
          if (error instanceof Error) {
            console.error('Error starting new run:', error.message);
          } else {
            console.error('Error starting new run:', error);
          }
          setLoading(false);
        });

    // Cleanup subscriptions and event listeners on unmount.
    return () => {
      window.removeEventListener('beforeunload', saveOnUnload);
      startedLoadingSub.off();
      doneLoadingSub.off();
      syncSub.off();
    };
  }, []);

  // Memoize the context value to avoid unnecessary re-renders.
  const context = useMemo(
    () => ({
      loading,
      session,
      exportSave: controller.exportSave.bind(controller),
      loadSave: controller.loadSave.bind(controller),
      onCardClick: controller.onCardClick.bind(controller),
      save: controller.save.bind(controller),
      startNewRun: controller.startNewRun.bind(controller),
      startNewSession: controller.startNewSession.bind(controller),
      setBgMusic: controller.setBgMusic.bind(controller)
    }),
    [loading, session]
  );

  return (
    <GameContext.Provider value={context}>{children}</GameContext.Provider>
  );
}
