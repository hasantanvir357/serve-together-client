import { betterAuth } from 'better-auth';

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || 'servetogether_better_auth_secret_key_2026',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  // CORS: accept session/OAuth requests from every local app origin.
  trustedOrigins: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL || '',
  ],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
