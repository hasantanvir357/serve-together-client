import { auth } from '../../../../lib/auth'; // আপনার BetterAuth server config
import { toNextJsHandler } from 'better-auth/next-js';

export const { GET, POST } = toNextJsHandler(auth);
