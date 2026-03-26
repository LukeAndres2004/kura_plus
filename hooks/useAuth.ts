import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type AuthStep = 'idle' | 'loading' | 'done';
export type AuthMode = 'signin' | 'signup';

export interface UseAuthResult {
  user: User | null;
  session: Session | null;
  loading: boolean;
  step: AuthStep;
  error: string | null;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────

export function useAuth(): UseAuthResult {
  const [user, setUser]       = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep]       = useState<AuthStep>('idle');
  const [error, setError]     = useState<string | null>(null);

  // ── Auth state listener ───────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Sign Up ───────────────────────────────────────────────
  const signUp = useCallback(async (email: string, password: string, username: string) => {
    setError(null);
    setStep('loading');

    const { error: sbError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });

    if (sbError) {
      setError(friendlyError(sbError.message));
      setStep('idle');
      return;
    }

    // Create profile row immediately
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').upsert({
        id:           user.id,
        name:         username,
        avatar_color: '#1A8B3C',
        updated_at:   new Date().toISOString(),
      });
    }

    setStep('done');
  }, []);

  // ── Sign In ───────────────────────────────────────────────
  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    setStep('loading');

    const { error: sbError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (sbError) {
      setError(friendlyError(sbError.message));
      setStep('idle');
      return;
    }

    setStep('done');
  }, []);

  // ── Sign Out ──────────────────────────────────────────────
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setStep('idle');
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { user, session, loading, step, error, signUp, signIn, signOut, clearError };
}

// ─────────────────────────────────────────────────────────────
// Friendly errors
// ─────────────────────────────────────────────────────────────

function friendlyError(msg: string): string {
  if (msg.includes('already registered'))   return 'An account with this email already exists.';
  if (msg.includes('Invalid login'))        return 'Incorrect email or password.';
  if (msg.includes('Email not confirmed'))  return 'Please verify your email first.';
  if (msg.includes('Password should'))      return 'Password must be at least 6 characters.';
  if (msg.includes('network'))              return 'Network error. Check your connection.';
  return msg;
}