import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { fieldAria } from '@/components/common/field-aria';
import { FormField } from '@/components/common/FormField';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { ROUTES } from '@/config/routes';
import { ApiError } from '@/types/api';

import { useCurrentUser, useLogin } from '../hooks/use-auth';
import { loginSchema } from '../schemas/login-schema';

import type { LoginInput } from '../schemas/login-schema';

export function LoginPage() {
  const { data: user } = useCurrentUser();
  const login = useLogin();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? ROUTES.home;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  if (user) {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (input: LoginInput): Promise<void> => {
    try {
      await login.mutateAsync(input);
      navigate(from, { replace: true });
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Unable to sign in. Please try again.';
      setError('root', { message });
    }
  };

  return (
    <section>
      <div className="mb-7 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Welcome back</h1>
        <p className="mt-1.5 text-sm text-slate-500">Sign in to manage healthcare resources.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        <FormField id="email" label="Email" error={errors.email?.message}>
          <Input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...fieldAria('email', { error: Boolean(errors.email) })}
            {...register('email')}
          />
        </FormField>

        <FormField id="password" label="Password" error={errors.password?.message}>
          <PasswordInput
            autoComplete="current-password"
            placeholder="••••••••"
            {...fieldAria('password', { error: Boolean(errors.password) })}
            {...register('password')}
          />
        </FormField>

        {errors.root ? (
          <p
            role="alert"
            className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
          >
            {errors.root.message}
          </p>
        ) : null}

        <Button type="submit" disabled={isSubmitting} className="mt-1">
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </section>
  );
}
