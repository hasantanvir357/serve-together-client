"use client";

import { useAuth, type AuthUser } from "@/context/AuthContext";

/**
 * Small `useSession` shim matching the shape the app's pages expect
 * (`{ data: session }` where `session.user` is the signed-in user).
 *
 * It is backed by the AuthContext placeholder auth (localStorage session).
 * When real auth lands, swap this implementation without touching callers.
 */
export type Session = {
  user: AuthUser;
  expires: string;
};

export type UseSessionResult = {
  data: Session | null;
  isPending: boolean;
  error: Error | null;
};

export function useSession(): UseSessionResult {
  const { user } = useAuth();

  const data: Session | null = user ? { user, expires: "" } : null;

  return {
    data,
    isPending: false,
    error: null,
  };
}
