
import { createClient } from '@supabase/supabase-js';
import { getEnv } from '../utils/env';

// Mengambil kunci langsung dari environment sistem (prioritas deployment)
const url = getEnv('VITE_DATABASE_URL');
const key = getEnv('VITE_SUPABASE_ANON_KEY');

export const supabase = createClient(url, key);
