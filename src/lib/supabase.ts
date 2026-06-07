// Single Supabase client for the whole app. Imported wherever we need to talk
// to the backend. Don't create new clients elsewhere — share this one so we
// get a single auth session.
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY. ' +
      'Check .env.local — it should match .env.example.'
  );
}

export const supabase = createClient(url, key, {
  auth: {
    // Persist the auth session in localStorage so users stay signed in across reloads.
    persistSession: true,
    // Auto-refresh tokens before they expire.
    autoRefreshToken: true,
  },
});
