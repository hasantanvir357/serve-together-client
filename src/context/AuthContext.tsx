'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authClient } from '../lib/auth-client';

export interface AuthUser {
  name?: string;
  email: string;
  image?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // BetterAuth cookie session — this is what hydrates the logged-in state
  // immediately after the Google OAuth redirect back to the app.
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending) return;

    const run = async () => {
      // Yield first: setState must not run synchronously in the effect body
      // (react-hooks/set-state-in-effect), so sync it after hydration instead.
      await Promise.resolve();

      if (session?.user) {
        const currentUser: AuthUser = {
          name: session.user.name || 'User',
          email: session.user.email,
          image: session.user.image || undefined,
        };
        setUser(currentUser);
        try {
          localStorage.setItem(LEGACY_USER_KEY, JSON.stringify(currentUser));
        } catch {
          // Storage unavailable — in-memory state still updates.
        }

        // Keep a JWT for the Express backend (only when a session exists).
        fetch('http://localhost:5000/api/auth/jwt-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: currentUser.email, name: currentUser.name }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.token) localStorage.setItem('token', data.token);
          })
          .catch(() => null);
      } else {
        // No BetterAuth session: fall back to the local email-login user.
        setUser(readLegacyUser());
      }

      setLoading(false);
    };

    void run();
  }, [session, isPending]);

  const login = (userData: AuthUser) => {
    setUser(userData);
    try {
      localStorage.setItem(LEGACY_USER_KEY, JSON.stringify(userData));
    } catch {
      // Storage unavailable — state still updates in memory.
    }
  };

  const logout = async () => {
    // Clear local state first so the session effect can never resurrect it.
    setUser(null);
    try {
      localStorage.removeItem(LEGACY_USER_KEY);
      localStorage.removeItem('token');
    } catch {
      // Ignore storage errors.
    }
    try {
      await authClient.signOut();
    } catch {
      // Cookie may already be gone.
    }
  };

  return (
    <AuthContext.Provider value={{ user,setUser, login, logout, loading }}>
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
