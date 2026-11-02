'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Browser Supabase client using the ANON key.
 *
 * Used exclusively for Realtime: the "doorbell" that tells a client the
 * `games` row changed (so it refetches state from the API) and the
 * cosmetic presence dot. It is never used to write game state — all
 * writes go through the Next.js API routes. RLS only grants the anon
 * role SELECT on the game tables.
 *
 * Returns null when the public env vars are missing; callers must then
 * rely on polling alone.
 */
let cached: SupabaseClient | null = null;

export function getBrowserClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;

  if (!cached) {
    cached = createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }
  return cached;
}
