import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        'Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
}

// Stand-in used only when the env vars are absent, so the UI can still render
// instead of crashing. Must implement every method the app calls, including the
// realtime cleanup hooks.
const noConfigSupabase = {
    auth: {
        getSession: async () => ({ data: { session: null } }),
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
        signInWithOAuth: async () => ({ error: new Error('Supabase is not configured.') }),
        signOut: async () => ({ error: new Error('Supabase is not configured.') }),
    },
    from: () => ({
        select: async () => ({ data: null, error: new Error('Supabase is not configured.') }),
        insert: async () => ({ data: null, error: new Error('Supabase is not configured.') }),
        upsert: async () => ({ data: null, error: new Error('Supabase is not configured.') }),
        delete: async () => ({ data: null, error: new Error('Supabase is not configured.') }),
        update: async () => ({ data: null, error: new Error('Supabase is not configured.') }),
        eq: function () { return this; },
        ilike: function () { return this; },
        maybeSingle: async () => ({ data: null, error: new Error('Supabase is not configured.') }),
        order: function () { return this; },
    }),
    channel: () => ({
        on: function () { return this; },
        subscribe: async () => ({}),
    }),
    removeChannel: () => { },
    rpc: async () => ({ data: null, error: new Error('Supabase is not configured.') }),
} as any;

function hasValidSupabaseConfig(): boolean {
    if (!supabaseUrl || !supabaseAnonKey) return false;

    // createClient throws on anything that isn't a real http(s) URL, which would
    // take down the whole route during prerender/build when only a placeholder
    // is configured. Treat placeholders as "not configured yet".
    try {
        const parsed = new URL(supabaseUrl);
        const isHttp = parsed.protocol === 'http:' || parsed.protocol === 'https:';
        const isPlaceholder = supabaseUrl.includes('YOUR-') || supabaseUrl.includes('YOUR_');
        return isHttp && !isPlaceholder;
    } catch {
        return false;
    }
}

export const supabase = hasValidSupabaseConfig()
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            flowType: 'implicit',
            detectSessionInUrl: true,
            persistSession: true,
            autoRefreshToken: true,
        },
    })
    : noConfigSupabase;
