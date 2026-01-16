
// Robust Environment Variable Polyfill
if (typeof window !== 'undefined') {
  (window as any).process = (window as any).process || { env: {} };
  
  // Deteksi kunci dari berbagai kemungkinan sistem build (Vite/Render)
  const envKey = (window as any).process?.env?.API_KEY || (import.meta as any).env?.VITE_API_KEY;
  if (envKey) (window as any).process.env.API_KEY = envKey;
  
  const dbUrl = (window as any).process?.env?.VITE_DATABASE_URL || (import.meta as any).env?.VITE_DATABASE_URL;
  if (dbUrl) (window as any).process.env.VITE_DATABASE_URL = dbUrl;

  const dbKey = (window as any).process?.env?.VITE_SUPABASE_ANON_KEY || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
  if (dbKey) (window as any).process.env.VITE_SUPABASE_ANON_KEY = dbKey;
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
