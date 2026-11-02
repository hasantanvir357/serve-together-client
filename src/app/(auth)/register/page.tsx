'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { FormEvent } from 'react';
import * as React from 'react';
import { toast } from '../../../components/ui/toast';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { useAuth } from '../../../context/AuthContext';
import { authClient } from '../../../lib/auth-client';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HAS_UPPERCASE = /[A-Z]/;
const HAS_LOWERCASE = /[a-z]/;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type RegisterValues = {
  name: string;
  email: string;
  photoURL: string;
  password: string;
  confirmPassword: string;
};

type RegisterField = keyof RegisterValues;
type RegisterErrors = Partial<Record<RegisterField, string>>;

function validate(values: RegisterValues): RegisterErrors {
  const errors: RegisterErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Please enter your full name.';
  }
  if (!EMAIL_PATTERN.test(values.email)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (values.password.length < 6 || !HAS_UPPERCASE.test(values.password) || !HAS_LOWERCASE.test(values.password)) {
    errors.password =
      'Password must be at least 6 characters long, contain at least one uppercase and one lowercase letter.';
  }
  if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
}

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [values, setValues] = React.useState<RegisterValues>({
    name: '',
    email: '',
    photoURL: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = React.useState<RegisterErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleChange = (field: RegisterField) => (value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

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
    } catch {
      toast.add({
        title: 'Sign-Up Error',
        description: 'Failed to sign up with Google.',
        type: 'error',
      });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate(values);
    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors);
      toast.add({
        title: 'Validation Error',
        description: nextErrors.password || nextErrors.name || nextErrors.email || nextErrors.confirmPassword || 'Please fix the highlighted fields.',
        type: 'error',
      });
      return;
    }

    setIsSubmitting(true);

    await fetchAndSaveToken(values.email, values.name.trim());

    login({
      name: values.name.trim(),
      email: values.email,
      image: values.photoURL || undefined,
    });

    toast.add({
      title: 'Account created',
      description: `Welcome aboard, ${values.name}!`,
      type: 'success',
    });
    router.push('/');
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-md dark:border-slate-800 dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-2xl font-bold dark:text-white">Create an account</CardTitle>
          <CardDescription className="dark:text-slate-400">
            Join ServeTogether to volunteer in your community.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="register-name" className="dark:text-slate-200">
                Full Name
              </Label>
              <Input
                id="register-name"
                name="name"
                placeholder="Your Name"
                required
                value={values.name}
                aria-invalid={errors.name ? true : undefined}
                onChange={(e) => handleChange('name')(e.target.value)}
                className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
              {errors.name && (
                <p role="alert" className="text-xs text-destructive">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="register-email" className="dark:text-slate-200">
                Email
              </Label>
              <Input
                id="register-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                value={values.email}
                aria-invalid={errors.email ? true : undefined}
                onChange={(e) => handleChange('email')(e.target.value)}
                className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
              {errors.email && (
                <p role="alert" className="text-xs text-destructive">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="register-photourl" className="dark:text-slate-200">
                Photo URL (Optional)
              </Label>
              <Input
                id="register-photourl"
                name="photoURL"
                type="url"
                placeholder="https://example.com/photo.jpg"
                value={values.photoURL}
                onChange={(e) => handleChange('photoURL')(e.target.value)}
                className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="register-password" className="dark:text-slate-200">
                Password
              </Label>
              <Input
                id="register-password"
                name="password"
                type="password"
                placeholder="Min 6 chars, upper & lowercase (e.g. Serve123)"
                autoComplete="new-password"
                required
                value={values.password}
                aria-invalid={errors.password ? true : undefined}
                onChange={(e) => handleChange('password')(e.target.value)}
                className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
              {errors.password && (
                <p role="alert" className="text-xs text-destructive leading-normal">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="register-confirm-password" className="dark:text-slate-200">
                Confirm Password
              </Label>
              <Input
                id="register-confirm-password"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                required
                value={values.confirmPassword}
                aria-invalid={errors.confirmPassword ? true : undefined}
                onChange={(e) => handleChange('confirmPassword')(e.target.value)}
                className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
              {errors.confirmPassword && (
                <p role="alert" className="text-xs text-destructive">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <Button type="submit" disabled={isSubmitting} className="mt-2 w-full bg-[#0284c7] hover:bg-sky-700">
              {isSubmitting ? 'Creating account...' : 'Create Account'}
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
            Sign up with Google
          </Button>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground dark:text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-[#0284c7] hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
