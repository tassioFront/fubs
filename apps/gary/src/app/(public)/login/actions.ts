'use server';
import z from 'zod';
import { signIn } from '../../../../auth.config';
import { CredentialsSignin } from 'next-auth';
import { redirect } from 'next/navigation';
import { LoginFormState } from './types';

export async function login(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const CredentialsSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
  });

  try {
    const result = CredentialsSchema.safeParse({
      email,
      password,
    });

    if (!result.success) {
      return { formError: 'Invalid credentials format', email, password: '' };
    }
    await signIn('credentials', {
      email: result.data.email,
      password: result.data.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof CredentialsSignin) {
      return { formError: 'Invalid credentials provided', email, password: '' };
    }

    return { formError: 'Sorry. Please try again later.', email, password: '' };
  }

  redirect('/workspace');
}
