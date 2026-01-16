
export const getEnv = (key: string): string => {
  const cleanKey = key.replace('VITE_', '');
  
  // 1. Prioritas Utama: Environment Variables Sistem (Vite / Node)
  // Ini memastikan API Key yang diset di Dashboard Hosting (Vercel/Netlify/dll) terbaca sempurna.
  const vEnv = (import.meta as any).env || {};
  const pEnv = (typeof process !== 'undefined' ? process.env : {}) || {};
  const wEnv = (window as any).process?.env || {};
  
  const sources = [vEnv, pEnv, wEnv];

  // Alias untuk kemudahan pencarian kunci
  const aliases: Record<string, string[]> = {
    'VITE_TELEGRAM_BOT_TOKEN': ['TELEGRAM_BOT_TOKEN', 'BOT_TOKEN', 'TG_TOKEN'],
    'VITE_TELEGRAM_CHAT_ID': ['TELEGRAM_CHAT_ID', 'CHAT_ID', 'TG_CHAT_ID'],
    'VITE_GEMINI_API_KEY_1': ['API_KEY', 'GEMINI_API_KEY', 'GOOGLE_API_KEY'],
    'VITE_DATABASE_URL': ['DATABASE_URL', 'SUPABASE_URL'],
    'VITE_SUPABASE_ANON_KEY': ['SUPABASE_ANON_KEY', 'ANON_KEY']
  };

  const searchKeys = Array.from(new Set([key, cleanKey, ...(aliases[key] || [])]));

  for (const sKey of searchKeys) {
    for (const source of sources) {
      if (source && source[sKey] && String(source[sKey]).trim() !== "") {
        return String(source[sKey]);
      }
    }
  }

  // 2. Fallback: LocalStorage (Hanya untuk override manual saat pengembangan/testing)
  const storageKey = `SATMOKO_OVERRIDE_${cleanKey}`;
  const localValue = localStorage.getItem(storageKey);
  if (localValue) return localValue;

  // 3. Fallbacks Default (Supabase Default)
  const fallbacks: Record<string, string> = {
    'VITE_DATABASE_URL': 'https://urokqoorxuiokizesiwa.supabase.co',
    'VITE_SUPABASE_ANON_KEY': 'sb_publishable_G1udRukMNJjDM6wlVD3xtw_IF8Yrbd8',
    'VITE_ADMIN_PASSWORD': 'admin7362',
    'VITE_ADMIN_EMAILS': 'pringgosatmoko@gmail.com'
  };

  return fallbacks[key] || "";
};

export const setEnvOverride = (key: string, value: string) => {
  const cleanKey = key.replace('VITE_', '');
  const storageKey = `SATMOKO_OVERRIDE_${cleanKey}`;
  if (value.trim() === "") {
    localStorage.removeItem(storageKey);
  } else {
    localStorage.setItem(storageKey, value);
  }
  window.dispatchEvent(new Event('env_updated'));
};
