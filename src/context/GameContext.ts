import { useContext, createContext } from 'react';
import type { GameControllerActions } from '../core/GameController';

export interface Context
  extends Omit<
    GameControllerActions,
    'isLoading' | 'onSync' | 'onLoading' | 'save' | 'startNewRun'
  > {
  loading: boolean;
}
export const GameContext = createContext<Context | null>(null);
export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context)
    throw new Error('useGameContext must be used within a GameProvider');
  return context;
};
