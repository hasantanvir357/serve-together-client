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

const STORAGE_KEY = "serve-together-auth";
// Fired in the same tab after login/logout (the native `storage` event only
// fires for changes made by other tabs).
const CHANGE_EVENT = "serve-together:auth-change";

/**
 * @typedef {{ name: string, email: string }} AuthUser
 * @typedef {{
 *   user: AuthUser | null,
 *   login: (name: string, email: string) => AuthUser,
 *   logout: () => void,
 * }} AuthValue
 */

/** @type {React.Context<AuthValue | null>} */
const AuthContext = React.createContext(null);

// Cached snapshot — React requires getSnapshot() to return the same reference
// as long as the underlying value has not changed.
/** @type {AuthUser | null | undefined} */
let cachedUser;

function parseUser(raw) {
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed.name === "string" ? parsed : null;
  } catch {
    return null;
  }
}

function readUser() {
  try {
    return parseUser(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

function writeUser(user) {
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

function getSnapshot() {
  if (typeof window === "undefined") {
    return null;
  }
  if (cachedUser === undefined) {
    cachedUser = readUser();
  }
  return cachedUser;
}

function getServerSnapshot() {
  return null;
}

function subscribe(onStoreChange) {
  const handleLocalChange = () => onStoreChange();
  const handleStorage = (event) => {
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

export function AuthProvider({ children }) {
  const user = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const login = React.useCallback((name, email) => {
    const nextUser = { name, email };
    writeUser(nextUser);
    return nextUser;
  }, []);

  const logout = React.useCallback(() => {
    writeUser(null);
  }, []);

  /** @type {AuthValue} */
  const value = { user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * @returns {AuthValue}
 */
export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
