'use client';

import { useAuth, type AuthUser } from '@/context/AuthContext';
import { createAuthClient } from 'better-auth/client';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000',
});
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

  const data: Session | null = user ? { user, expires: '' } : null;

  return {
    data,
    isPending: false,
    error: null,
  };
}
