/*
  Supabase client initialization that works on Web (Next/React) and React Native.
  - Reads from environment at runtime when available
  - Falls back to a lightweight dynamic import for React Native env via react-native-config (optional)
*/

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
//  Checking 
const SUPABASE_URL = 'https://voxyajhsvpwaevyctrwy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZveHlhamhzdnB3YWV2eWN0cnd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MDUwMjMsImV4cCI6MjA3MjI4MTAyM30.h5cg4Au23r8BIywPP2lc8d2yYIti2iFE3COuZwTMLbo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // important for RN
  },
});
//  checking 

type Env = {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
};

function resolveEnv(): Required<Env> {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

  // React Native fallback: try react-native-config if process.env is empty
  if ((!url || !key)) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const RNConfig = require('react-native-config');
      url = url || RNConfig?.SUPABASE_URL || RNConfig?.NEXT_PUBLIC_SUPABASE_URL || '';
      key = key || RNConfig?.SUPABASE_ANON_KEY || RNConfig?.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    } catch {}
  }

  if (!url || !key) {
    throw new Error('[supabase] Missing SUPABASE_URL or SUPABASE_ANON_KEY in env.');
  }
  return { SUPABASE_URL: url, SUPABASE_ANON_KEY: key };
}

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (client) return client;
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = resolveEnv();
  client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return client;
}

export type { SupabaseClient };


