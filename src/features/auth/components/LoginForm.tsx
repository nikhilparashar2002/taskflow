'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldError } from '@/components/shared/FieldError';
import { ApiError } from '@/lib/api-client';
import { APP_ROUTES } from '@/lib/constants';
import { isValidEmail } from '@/lib/validation';
import { useLogin } from '@/features/auth/hooks/useAuth';

interface FormErrors {
  email?: string;
  password?: string;
  form?: string;
}

export function LoginForm() {
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  function validate(): boolean {
    const next: FormErrors = {};
    if (!isValidEmail(email)) next.email = 'Enter a valid email address';
    if (!password) next.password = 'Password is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    login.mutate(
      { email, password },
      {
        onError: (error) => {
          const message =
            error instanceof ApiError ? error.message : 'Something went wrong. Try again.';
          setErrors({ form: message });
        },
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={Boolean(errors.email)}
        />
        <FieldError message={errors.email} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={Boolean(errors.password)}
        />
        <FieldError message={errors.password} />
      </div>

      {errors.form && (
        <p className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
          {errors.form}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={login.isPending}>
        {login.isPending && <Loader2 className="animate-spin" />}
        Sign in
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        Don&apos;t have an account?{' '}
        <Link href={APP_ROUTES.register} className="text-foreground font-medium hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
