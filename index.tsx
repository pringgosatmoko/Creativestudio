
// Robust Environment Variable Polyfill for Satmoko Studio V3.1
if (typeof window !== 'undefined') {
  const win = window as any;
  win.process = win.process || { env: {} };
  win.process.env = win.process.env || {};
  
  const metaEnv = (import.meta as any).env || {};
  
  const syncVar = (key: string) => {
    // Mencoba mengambil dari import.meta.env (Vite) atau process.env (Node/Vercel)
    const val = metaEnv[key] || win.process.env[key] || "";
    win.process.env[key] = val;
    return val;
  };

  // Database & Auth
  syncVar('VITE_DATABASE_URL');
  syncVar('VITE_SUPABASE_ANON');
  syncVar('VITE_ADMIN_EMAILS');
  syncVar('VITE_PASSW');
  syncVar('VITE_ADMIN_PHONES');

  // Telegram Integration
  syncVar('VITE_TELEGRAM_CHAT_ID');
  syncVar('VITE_TELEGRAM_BOT_TOKEN');

  // Multi-Slot Gemini Keys
  const k1 = syncVar('VITE_GEMINI_API_1');
  syncVar('VITE_GEMINI_API_2');
  syncVar('VITE_GEMINI_API_3');

  // Set the primary API_KEY used by the SDK
  // Jika VITE_GEMINI_API_1 ada, gunakan itu sebagai default
  if (k1) {
    win.process.env.API_KEY = k1;
  } else {
    // Fallback ke process.env.API_KEY jika ada (biasanya di AI Studio Preview)
    win.process.env.API_KEY = win.process.env.API_KEY || "";
  }

  // Register Service Worker for PWA
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(registration => {
        console.log('SW registered: ', registration);
      }).catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
    });
  }
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
