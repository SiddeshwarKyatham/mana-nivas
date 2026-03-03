import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

interface AppUser {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapSupabaseUser = (supabaseUser: SupabaseUser | null, profile?: { full_name?: string | null; role?: string | null }): AppUser | null => {
  if (!supabaseUser) return null;

  const metadata = supabaseUser.user_metadata || {};
  const fullName = profile?.full_name || (metadata.full_name as string) || '';
  const roleFromProfile = profile?.role === 'admin' ? 'admin' : profile?.role === 'user' ? 'user' : null;
  const roleFromMetadata = (metadata.role as 'user' | 'admin') || 'user';

  return {
    _id: supabaseUser.id,
    name: fullName || supabaseUser.email?.split('@')[0] || 'User',
    email: supabaseUser.email || '',
    role: roleFromProfile || roleFromMetadata,
  };
};

const getProfile = async (userId: string): Promise<{ full_name?: string | null; role?: string | null } | undefined> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', userId)
    .single();

  if (error) {
    return undefined;
  }

  return data as { full_name?: string | null; role?: string | null };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!isMounted) return;

        setSession(data.session);
        const supabaseUser = data.session?.user ?? null;
        const profile = supabaseUser ? await getProfile(supabaseUser.id) : undefined;
        setUser(mapSupabaseUser(supabaseUser, profile));
      } catch (error) {
        console.error('Failed to initialize Supabase auth:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      const supabaseUser = newSession?.user ?? null;
      const profile = supabaseUser ? await getProfile(supabaseUser.id) : undefined;
      setUser(mapSupabaseUser(supabaseUser, profile));
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    setSession(null);
    setUser(null);
  };

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      session,
      token: session?.access_token ?? null,
      isAuthenticated: !!session?.user,
      loading,
      logout,
    }),
    [user, session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
