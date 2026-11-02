'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { FormEvent } from 'react';
import * as React from 'react';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { authClient } from '@/lib/auth-client';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function nameFromEmail(email: string): string {
  return email
    .split('@')[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

type LoginField = 'email' | 'password';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [values, setValues] = React.useState({ email: '', password: '' });
  const [errors, setErrors] = React.useState<Partial<Record<LoginField, string>>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleChange = (field: LoginField) => (value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // JWT Fetch helper
  const fetchAndSaveToken = async (email: string, name: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/jwt-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
    } catch (err) {
      console.error('Failed to fetch JWT token', err);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const res = await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/',
      });
      // Social sign-in may return a redirect (no user yet) — the AuthContext
      // fetches the backend JWT once the session hydrates after redirect.
      if (res?.data && 'user' in res.data && res.data.user) {
        await fetchAndSaveToken(res.data.user.email, res.data.user.name || '');
      }
    } catch (error) {
      toast.add({
        title: 'Sign-In Error',
        description: 'Failed to sign in with Google.',
        type: 'error',
      });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Partial<Record<LoginField, string>> = {};
    if (!EMAIL_PATTERN.test(values.email)) {
      nextErrors.email = 'Please enter a valid email address.';
    }
    if (!PASSWORD_PATTERN.test(values.password)) {
      nextErrors.password =
        'Password must be at least 6 characters long, contain at least one uppercase and one lowercase letter.';
    }

    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    const name = nameFromEmail(values.email);

    await fetchAndSaveToken(values.email, name);

    login({ name, email: values.email });
    toast.add({
      title: 'Signed in',
      description: `Welcome back, ${name}!`,
      type: 'success',
    });
    router.push('/');
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-md dark:border-slate-800 dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-2xl font-bold dark:text-white">Login</CardTitle>
          <CardDescription className="dark:text-slate-400">
            Sign in to create and manage your volunteering events.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="login-email" className="dark:text-slate-200">
                Email
              </Label>
              <Input
                id="login-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                value={values.email}
                aria-invalid={errors.email ? true : undefined}
                onChange={(event) => handleChange('email')(event.target.value)}
                className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
              {errors.email ? (
                <p role="alert" className="text-xs text-destructive">
                  {errors.email}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="login-password" className="dark:text-slate-200">
                Password
              </Label>
              <Input
                id="login-password"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
                value={values.password}
                aria-invalid={errors.password ? true : undefined}
                onChange={(event) => handleChange('password')(event.target.value)}
                className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
              {errors.password ? (
                <p role="alert" className="text-xs text-destructive leading-normal">
                  {errors.password}
                </p>
              ) : null}
            </div>

            <Button type="submit" disabled={isSubmitting} className="mt-2 w-full bg-[#0284c7] hover:bg-sky-700">
              {isSubmitting ? 'Signing in...' : 'Login'}
            </Button>
          </form>

          <div className="relative my-4 flex items-center justify-center">
            <span className="absolute bg-card px-2 text-xs text-muted-foreground dark:bg-slate-900">OR</span>
            <hr className="w-full border-slate-200 dark:border-slate-800" />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-2 border-slate-300 dark:border-slate-700 dark:text-white"
          >
            <svg className="size-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Sign in with Google
          </Button>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground dark:text-slate-400">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-[#0284c7] hover:underline">
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
