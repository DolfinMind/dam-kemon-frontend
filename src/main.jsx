import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { applyTheme, getTheme } from './api/theme'

// Apply persisted theme synchronously before first paint to avoid a flash.
applyTheme(getTheme());

// iOS Safari only renders :active states (our global press feedback in
// index.css) when at least one touch listener exists on the document.
document.addEventListener('touchstart', () => {}, { passive: true });

import { HelmetProvider } from 'react-helmet-async';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
)
