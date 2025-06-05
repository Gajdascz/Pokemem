import './styles/normalize.css';
import '.styles/index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';

const root = document.getElementById('root');

if (!root) throw new Error('Root element not found');
ReactDOM.createRoot(root).render(<React.StrictMode></React.StrictMode>);
