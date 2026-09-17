import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Builds a server-side Supabase client, returning null when the environment is
 * not actually configured (missing vars, or placeholder values). Routes should
 * treat null as "unavailable" and return a clean 503 rather than letting
 * createClient throw mid-request.
 */
export function createServerClient(useServiceRole = false): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = useServiceRole
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  try {
    const parsed = new URL(url);
    const isHttp = parsed.protocol === 'http:' || parsed.protocol === 'https:';
    const isPlaceholder = url.includes('YOUR-') || url.includes('YOUR_');
    if (!isHttp || isPlaceholder) return null;
  } catch {
    return null;
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
