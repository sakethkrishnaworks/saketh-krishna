import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-only helpers.
 *
 * The browser cannot be trusted to decide who is an admin, so every privileged
 * route re-derives identity here from the access token the client forwards,
 * using the service-role key (which bypasses RLS).
 */

interface AuthResult {
  ok: boolean;
  status: number;
  message: string;
  userId?: string;
  email?: string;
}

let cachedClient: SupabaseClient | null = null;

function serviceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Fail closed: without the service role key we cannot verify identity.
  if (!url || !serviceKey) return null;

  if (!cachedClient) {
    cachedClient = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return cachedClient;
}

/** True only when the service role key is configured. */
export function hasServiceRole(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/**
 * Validates the `Authorization: Bearer <access_token>` header and confirms the
 * user holds an admin row. Returns a 401/403/503 result when it cannot.
 */
export async function requireAdmin(request: Request): Promise<AuthResult> {
  const client = serviceClient();
  if (!client) {
    return {
      ok: false,
      status: 503,
      message:
        'Server is not configured to verify admin identity. Set SUPABASE_SERVICE_ROLE_KEY.',
    };
  }

  const header = request.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : '';

  if (!token) {
    return { ok: false, status: 401, message: 'Missing authentication token.' };
  }

  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) {
    return { ok: false, status: 401, message: 'Invalid or expired session.' };
  }

  const { data: adminRow, error: adminError } = await client
    .from('admins')
    .select('user_id')
    .eq('user_id', data.user.id)
    .maybeSingle();

  if (adminError) {
    return { ok: false, status: 500, message: 'Failed to look up admin record.' };
  }

  if (!adminRow) {
    return { ok: false, status: 403, message: 'This account does not have admin access.' };
  }

  return {
    ok: true,
    status: 200,
    message: '',
    userId: data.user.id,
    email: data.user.email,
  };
}
