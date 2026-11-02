export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const token = localStorage.getItem('token')?.trim();
    return token || null;
  } catch {
    return null;
  }
}

export function getAuthHeaders(): Record<string, string> | null {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : null;
}

export async function saveBackendToken(user: { email: string; name?: string }): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/jwt-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, name: user.name || 'User' }),
    });

    if (!response.ok) {
      return false;
    }

    const data: unknown = await response.json().catch(() => null);
    const token =
      data && typeof data === 'object' && 'token' in data && typeof data.token === 'string'
        ? data.token.trim()
        : '';

    if (!token) {
      return false;
    }

    localStorage.setItem('token', token);
    return true;
  } catch {
    return false;
  }
}
