'use client';

import { useActionState } from 'react';
import { login } from './actions';
import { Input } from '@/ui/Input';
import { Btn } from '@/ui/Btn';
import { LoginFormState } from './types';

function FormMessage({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="mb-4 rounded-md border border-gary-danger/40 bg-gary-danger/10 p-3 text-small text-gary-danger">
      {message}
    </div>
  );
}

export default function RegisterForm() {
  const [state, formAction, isPending] = useActionState<
    LoginFormState,
    FormData
  >(login, {} as LoginFormState);

  return (
    <form action={formAction} className="space-y-10">
      <FormMessage message={state?.formError} />

      <Input
        id="email"
        value="email"
        label="Email"
        type="email"
        ariaDescribedby="provide an email"
        defaultValue={state?.email}
      />

      <Input
        id="password"
        value="password"
        label="Password"
        type="password"
        ariaDescribedby="provide a password"
        defaultValue={state?.password}
      />

      <div className="pt-2 flex justify-center sm:justify-end">
        <Btn
          type="submit"
          variant="primary"
          loading={isPending}
          className="w-full sm:w-auto"
        >
          Login
        </Btn>
      </div>
    </form>
  );
}
