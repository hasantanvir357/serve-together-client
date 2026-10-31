"use client";

import * as React from "react";

/**
 * Placeholder auth state for ServeTogether.
 *
 * There is no backend auth yet, so the session lives in localStorage and is
 * exposed to React through `useSyncExternalStore` (no setState-in-effect,
 * and no hydration mismatch: the server snapshot is `null`).
 *
 * Swap `readUser`/`writeUser` for a real provider (NextAuth, server actions,
 * ...) without touching consumers.
 */

export type AuthUser = {
  name: string;
  email: string;
  image?: string;
};

export type AuthContextValue = {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "serve-together-auth";

// Fired in the same tab after login/logout (the native `storage` event only
// fires for changes made by other tabs).
const CHANGE_EVENT = "serve-together:auth-change";

// Cached snapshot — React requires getSnapshot() to return the same reference
// as long as the underlying value has not changed.
let cachedUser: AuthUser | null | undefined;

function parseUser(raw: string | null): AuthUser | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof (parsed as AuthUser).name === "string" &&
      typeof (parsed as AuthUser).email === "string"
    ) {
      return parsed as AuthUser;
    }
    return null;
  } catch {
    return null;
  }
}

function readUser(): AuthUser | null {
  try {
    return parseUser(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

function writeUser(user: AuthUser | null) {
  cachedUser = user;

  try {
    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Storage unavailable (private mode, quota, ...) — state still updates in memory.
  }

  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function getSnapshot(): AuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }
  if (cachedUser === undefined) {
    cachedUser = readUser();
  }
  return cachedUser;
}

function getServerSnapshot(): AuthUser | null {
  return null;
}

function subscribe(onStoreChange: () => void) {
  const handleLocalChange = () => onStoreChange();

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      cachedUser = readUser();
      onStoreChange();
    }
  };

  window.addEventListener(CHANGE_EVENT, handleLocalChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(CHANGE_EVENT, handleLocalChange);
    window.removeEventListener("storage", handleStorage);
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const user = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const login = React.useCallback((nextUser: AuthUser) => {
    writeUser(nextUser);
  }, []);

  const logout = React.useCallback(() => {
    writeUser(null);
  }, []);

  const value: AuthContextValue = React.useMemo(
    () => ({ user, login, logout }),
    [user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
