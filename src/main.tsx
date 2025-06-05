import './styles/normalize.css';
import './styles/index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import Game from './components';
import GameProvider from './context/GameProvider';

const root = document.getElementById('root');

if (!root) throw new Error('Root element not found');
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <GameProvider>
      <Game />
    </GameProvider>
  </React.StrictMode>
);
