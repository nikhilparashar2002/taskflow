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
import { useRegister } from '@/features/auth/hooks/useAuth';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  form?: string;
}

export function RegisterForm() {
  const register = useRegister();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  function validate(): boolean {
    const next: FormErrors = {};
    if (!name.trim()) next.name = 'Name is required';
    if (!isValidEmail(email)) next.email = 'Enter a valid email address';
    if (password.length < 6) next.password = 'Password must be at least 6 characters';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    register.mutate(
      { name: name.trim(), email, password },
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
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          type="text"
          autoComplete="name"
          placeholder="Jane Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={Boolean(errors.name)}
        />
        <FieldError message={errors.name} />
      </div>

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
          autoComplete="new-password"
          placeholder="At least 6 characters"
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

      <Button type="submit" className="w-full" disabled={register.isPending}>
        {register.isPending && <Loader2 className="animate-spin" />}
        Create account
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        Already have an account?{' '}
        <Link href={APP_ROUTES.login} className="text-foreground font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
