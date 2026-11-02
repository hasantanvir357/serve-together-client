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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HAS_UPPERCASE = /[A-Z]/;
const HAS_LOWERCASE = /[a-z]/;

type RegisterValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type RegisterField = keyof RegisterValues;
type RegisterErrors = Partial<Record<RegisterField, string>>;

function validate(values: RegisterValues): RegisterErrors {
  const errors: RegisterErrors = {};

  if (!values.firstName.trim()) {
    errors.firstName = 'Please enter your first name.';
  }
  if (!values.lastName.trim()) {
    errors.lastName = 'Please enter your last name.';
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
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = React.useState<RegisterErrors>({});

  const handleChange = (field: RegisterField) => (value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate(values);
    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors);
      return;
    }

    const fullName = `${values.firstName.trim()} ${values.lastName.trim()}`;
    login({
      name: fullName,
      email: values.email,
    });
    toast.add({
      title: 'Account created',
      description: `Welcome aboard, ${fullName}!`,
      type: 'success',
    });
    router.push('/');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Join ServeTogether to volunteer in your community.</CardDescription>
      </CardHeader>
      <CardContent>
        <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* First Name & Last Name grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="register-firstname">First Name</Label>
              <Input
                id="register-firstname"
                name="firstName"
                placeholder="Tanvir"
                required
                value={values.firstName}
                aria-invalid={errors.firstName ? true : undefined}
                onChange={(e) => handleChange('firstName')(e.target.value)}
              />
              {errors.firstName && (
                <p role="alert" className="text-xs text-destructive">
                  {errors.firstName}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="register-lastname">Last Name</Label>
              <Input
                id="register-lastname"
                name="lastName"
                placeholder="Hasan"
                required
                value={values.lastName}
                aria-invalid={errors.lastName ? true : undefined}
                onChange={(e) => handleChange('lastName')(e.target.value)}
              />
              {errors.lastName && (
                <p role="alert" className="text-xs text-destructive">
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="register-email">Email</Label>
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
            />
            {errors.email && (
              <p role="alert" className="text-xs text-destructive">
                {errors.email}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="register-password">Password</Label>
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
            />
            {errors.password && (
              <p role="alert" className="text-xs text-destructive leading-normal">
                {errors.password}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="register-confirm-password">Confirm Password</Label>
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
            />
            {errors.confirmPassword && (
              <p role="alert" className="text-xs text-destructive">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <Button type="submit" className="mt-2 w-full bg-[#0284c7] hover:bg-sky-700">
            Create Account
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-[#0284c7] hover:underline">
            Login
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
