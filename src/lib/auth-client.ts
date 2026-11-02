'use client';

import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000',
  // Always send/receive BetterAuth session cookies so the session written by
  // the Google OAuth callback is read back by get-session immediately after
  // the redirect — even when the client baseURL differs from the page origin.
  fetchOptions: {
    credentials: 'include',
  },
});

export const { signIn, signOut, signUp, useSession } = authClient;
