import LoginForm from './login-form';
import { auth } from '../../../../auth.config';
// import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    // uncomment this after has the logout option on workspace layout
    // redirect('/workspace');
  }

  return (
    <div>
      <section className="mx-auto max-w-5xl px-gutter py-16 md:py-24">
        <div className="mb-20">
          <h1 className="text-heading-1 mb-6 font-bold">Login</h1>
          <p className="max-w-2xl text-body-lg text-muted-foreground">
            Please enter your credentials to access your account.
          </p>
        </div>
        <LoginForm />
      </section>
    </div>
  );
}
