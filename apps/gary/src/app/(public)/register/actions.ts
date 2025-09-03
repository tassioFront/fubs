'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { mapError } from '@/app/utils/zod';
import { mapErrorFromUsers, registerUser } from '@/app/service/users';
import { RegisterFormState } from './types';
import { WorkspaceMemberRole } from '@fubs/shared/src/lib/types/user';
import { saveCustomer } from '@/app/service/stitch';

const RegisterSchema = z
  .object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirm: z.string().min(8, 'Confirm your password'),
  })
  .refine(
    async (d: { password: string; password_confirm: string }) =>
      d.password === d.password_confirm,
    {
      path: ['password_confirm'],
      message: 'Passwords do not match',
    }
  );

export async function registerAction(
  _prevState: RegisterFormState,
  formData: FormData
): Promise<RegisterFormState> {
  const raw = Object.fromEntries(formData.entries());
  const params = {
    first_name: raw.first_name,
    last_name: raw.last_name,
    email: raw.email,
    password: raw.password,
    password_confirm: raw.password_confirm,
  };

  try {
    const parsed = await RegisterSchema.parseAsync(params);
    const res = await registerUser({
      ...parsed,
      type: WorkspaceMemberRole.OWNER,
    });
    const user = await res.json();

    if (res.status === 400) {
      return {
        errors: mapErrorFromUsers(user as Record<string, string[]>),
        ...parsed,
      };
    }

    if (!res.ok) {
      return {
        formError: 'We got a problem. Please try again later.',
        ...parsed,
      };
    }

    /*
     * users-service does not send events, so we need to manually save the customer to Stitch here
     * once all service requests are done on the server
     */
    await saveCustomer({
      email: parsed.email,
      name: parsed.first_name,
      ownerId: user.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        errors: mapError(error.errors),
        ...(params as RegisterFormState),
      };
    }

    return {
      formError: 'Unknown error. Please try again later.',
      ...params,
    } as RegisterFormState;
  }

  redirect('/login?registered');
}
