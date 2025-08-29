import LoginForm from './login-form';

export default async function LoginPage() {
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
