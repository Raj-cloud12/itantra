import React from 'react';
import ReactDOM from 'react-dom/client';
import { MemoryRouter, BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

const isWebView = typeof window !== 'undefined' && window.location.protocol === 'file:';

const RouterComponent = isWebView ? MemoryRouter : BrowserRouter;
const routerProps = isWebView ? { initialEntries: ['/field'] } : {};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterComponent {...routerProps}>
      <App />
    </RouterComponent>
  </React.StrictMode>
);
