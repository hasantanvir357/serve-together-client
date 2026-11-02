'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authClient } from '../lib/auth-client';
import { saveBackendToken } from '../lib/api-client';

export interface AuthUser {
  name?: string;
  email: string;
  image?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  updateUser: (updates: Pick<AuthUser, 'name' | 'image'>) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LEGACY_USER_KEY = 'user';

function readLegacyUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(LEGACY_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    return parsed && typeof parsed.email === 'string' ? parsed : null;
  } catch {
    return null;
  }
}

function persistUser(user: AuthUser | null) {
  try {
    if (user) {
      localStorage.setItem(LEGACY_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LEGACY_USER_KEY);
    }
  } catch {
    // Storage can be unavailable in privacy-restricted browser contexts.
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending) return;

    const run = async () => {
      await Promise.resolve();

      if (session?.user) {
        const currentUser: AuthUser = {
          name: session.user.name || 'User',
          email: session.user.email,
          image: session.user.image || undefined,
        };
        setUser(currentUser);
        persistUser(currentUser);
        void saveBackendToken(currentUser);
      } else {
        setUser(readLegacyUser());
      }

      setLoading(false);
    };

    void run();
  }, [session, isPending]);

  const login = (userData: AuthUser) => {
    setUser(userData);
    persistUser(userData);
    void saveBackendToken(userData);
  };

  const updateUser = async (updates: Pick<AuthUser, 'name' | 'image'>) => {
    if (!user) {
      throw new Error('You must be signed in to update your profile.');
    }

    const nextUser: AuthUser = {
      ...user,
      ...updates,
      image: updates.image || undefined,
    };

    setUser(nextUser);
    persistUser(nextUser);

    if (session?.user) {
      try {
        await authClient.updateUser({
          name: updates.name,
          image: updates.image ?? null,
        });
      } catch {
        // The local state remains the source of truth for this session.
      }
    }

    await saveBackendToken(nextUser);
  };

  const logout = async () => {
    setUser(null);
    try {
      localStorage.removeItem(LEGACY_USER_KEY);
      localStorage.removeItem('token');
    } catch {
    }
    try {
      await authClient.signOut();
    } catch {
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, updateUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
