import RegisterForm from './register-form';

export default async function RegisterPage() {
  return (
    <div>
      <section className="mx-auto max-w-5xl px-gutter py-16 md:py-24">
        <div className="mb-20">
          <h1 className="text-heading-1 mb-6 font-bold">Create your account</h1>
          <p className="max-w-2xl text-body-lg text-muted-foreground">
            Start organizing your projects with Fubs.
          </p>
        </div>
        <RegisterForm />
      </section>
    </div>
  );
}
