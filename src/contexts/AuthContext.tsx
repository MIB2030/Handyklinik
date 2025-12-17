import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, getUserRole, UserRole } from '../lib/supabase';

interface UserProfile {
  id: string;
  vorname: string;
  nachname?: string;
}

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadUserRole(session.user.id);
        } else {
          setUserRole(null);
          setLoading(false);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserRole = async (userId: string) => {
    const role = await getUserRole(userId);
    setUserRole(role);

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id, vorname, nachname')
      .eq('id', userId)
      .maybeSingle();

    setUserProfile(profile);
    setLoading(false);
  };

  const signIn = async (username: string, password: string) => {
    const { data, error: rpcError } = await supabase.rpc('get_email_by_username', {
      p_username: username
    });

    if (rpcError || !data) {
      return { error: new Error('Benutzer nicht gefunden') };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: data,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserRole(null);
    setUserProfile(null);
  };

  const value = {
    user,
    userRole,
    userProfile,
    isAdmin: userRole === 'admin',
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
