'use client';

import { useActionState } from 'react';
import { registerAction } from './actions';
import { Input } from '@/ui/Input';
import { Btn } from '@/ui/Btn';
import { RegisterFormState } from './types';

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
    RegisterFormState,
    FormData
  >(registerAction, {} as RegisterFormState);

  return (
    <form action={formAction} className="space-y-10">
      <FormMessage message={state?.formError} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="first_name"
          value="first_name"
          label="First Name"
          type="text"
          ariaDescribedby="provide a first name"
          errorMessage={state?.errors?.first_name}
          defaultValue={state?.first_name}
        />
        <Input
          id="last_name"
          value="last_name"
          label="Last Name"
          type="text"
          ariaDescribedby="provide a last name"
          errorMessage={state?.errors?.last_name}
          defaultValue={state?.last_name}
        />
      </div>

      <Input
        id="email"
        value="email"
        label="Email"
        type="email"
        ariaDescribedby="provide an email"
        errorMessage={state?.errors?.email}
        defaultValue={state?.email}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="password"
          value="password"
          label="Password"
          type="password"
          ariaDescribedby="provide a password"
          errorMessage={state?.errors?.password}
          defaultValue={state?.password}
        />
        <Input
          id="password_confirm"
          value="password_confirm"
          label="Confirm Password"
          type="password"
          ariaDescribedby="provide a password confirmation"
          errorMessage={state?.errors?.password_confirm}
          defaultValue={state?.password_confirm}
        />
      </div>

      <div className="pt-2 flex justify-center flex-col sm:justify-end sm:float-right">
        <Btn
          type="submit"
          variant="primary"
          loading={isPending}
          className="w-full sm:w-auto"
        >
          Create account
        </Btn>
        <div className="pt-4 text-center">
          <span className="text-sm text-gary-700">
            Already have an account?{' '}
            <a
              href="/login"
              className="text-gary-primary underline hover:text-gary-primary-dark transition-colors"
            >
              Log in
            </a>
          </span>
        </div>
      </div>
    </form>
  );
}
