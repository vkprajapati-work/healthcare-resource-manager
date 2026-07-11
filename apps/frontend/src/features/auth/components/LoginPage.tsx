import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { fieldAria } from '@/components/common/field-aria';
import { FormField } from '@/components/common/FormField';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
      <h1 className="mb-6 text-2xl font-semibold">Sign in</h1>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <FormField id="email" label="Email" error={errors.email?.message}>
          <Input
            type="email"
            autoComplete="email"
            {...fieldAria('email', { error: Boolean(errors.email) })}
            {...register('email')}
          />
        </FormField>

        <FormField id="password" label="Password" error={errors.password?.message}>
          <Input
            type="password"
            autoComplete="current-password"
            {...fieldAria('password', { error: Boolean(errors.password) })}
            {...register('password')}
          />
        </FormField>

        {errors.root ? (
          <p role="alert" className="text-sm text-red-700">
            {errors.root.message}
          </p>
        ) : null}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </section>
  );
}
