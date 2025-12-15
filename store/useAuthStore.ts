// store/useAuthStore.ts
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import * as SecureStore from 'expo-secure-store';

const BACKEND_JWT_KEY = 'tasker_backend_jwt';

interface AuthState {
  user: any;
  session: any;
  backendJwt: string | null;
  loading: boolean;

  init: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  backendJwt: null,
  loading: true,

  // Called once on app start
  init: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    let backendJwt = await SecureStore.getItemAsync(BACKEND_JWT_KEY);

    if (session?.user && !backendJwt) {
      backendJwt = await exchangeSupabaseForJwt(session.user.id, session.user.email!);
      await SecureStore.setItemAsync(BACKEND_JWT_KEY, backendJwt!);
    }

    set({
      user: session?.user ?? null,
      session,
      backendJwt: backendJwt ?? null,
      loading: false,
    });

    // Listen to auth changes
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const jwt = await exchangeSupabaseForJwt(session.user.id, session.user.email!);
        await SecureStore.setItemAsync(BACKEND_JWT_KEY, jwt);
        set({ user: session.user, session, backendJwt: jwt });
      } else {
        await SecureStore.deleteItemAsync(BACKEND_JWT_KEY);
        set({ user: null, session: null, backendJwt: null });
      }
    });
  },

  signIn: async (email: string, password: string) => {
    const res = await supabase.auth.signInWithPassword({ email, password });
    console.log(res)
    // if (error) throw error;
    // onAuthStateChange will handle JWT exchange
  },

  signUp: async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    await SecureStore.deleteItemAsync(BACKEND_JWT_KEY);
    set({ user: null, session: null, backendJwt: null });
  },
}));

// Exchange Supabase identity → Your powerful NestJS JWT
async function exchangeSupabaseForJwt(supabaseUid: string, email: string): Promise<string> {
  const response = await fetch('http://10.168.174.157:3000/auth/supabase-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ supabaseUid, email }),
  });

  if (!response.ok) throw new Error('Failed to get JWT from backend');

  const data = await response.json();
  return data.access_token; // This is your strong NestJS JWT
}
