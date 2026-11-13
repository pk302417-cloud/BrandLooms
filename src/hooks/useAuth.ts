import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import type { Role } from '@/types';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: Role;
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session) {
        loadProfile(data.session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: authData } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        (async () => { await loadProfile(newSession.user.id); })();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    async function loadProfile(userId: string) {
      try {
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('id, email, display_name, role')
          .eq('id', userId)
          .maybeSingle();

        if (profileError) throw profileError;
        if (!mounted) return;

        if (data) {
          setUser({
            id: data.id as string,
            email: data.email as string,
            displayName: data.display_name as string,
            role: data.role as Role,
          });
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    return () => {
      mounted = false;
      authData.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    setError(null);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (signUpError) {
      setError(signUpError.message);
      return false;
    }
    if (data.session) {
      setSession(data.session);
      return true;
    }
    // No session returned — email confirmation may be enabled.
    // Try to sign in immediately so the user doesn't get stuck.
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError('Account created, but email confirmation may be required. Please check your inbox or try signing in.');
      return false;
    }
    return true;
  };

  const signIn = async (email: string, password: string) => {
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      return false;
    }
    return true;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  };

  return { session, user, loading, error, signUp, signIn, signOut, setError };
}