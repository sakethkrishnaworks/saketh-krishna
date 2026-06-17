import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        'Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
}

const noConfigSupabase = {
    auth: {
        getSession: async () => ({ data: { session: null } }),
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
    }),
    channel: () => ({
        on: () => ({ subscribe: async () => ({}) }),
    }),
} as any;

export const supabase =
    supabaseUrl && supabaseAnonKey
        ? createClient(supabaseUrl, supabaseAnonKey)
        : noConfigSupabase;
