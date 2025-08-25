import Link from 'next/link';

function FeatureCard({
  title,
  body,
}: Readonly<{ title: string; body: string }>) {
  return (
    <div className="rounded-xl border border-muted bg-muted/40 p-5 backdrop-blur-sm">
      <h3 className="text-heading-3 font-semibold">{title}</h3>
      <p className="mt-2 text-body text-muted-foreground">{body}</p>
    </div>
  );
}
export default function Page() {
  return (
    <main className="min-h-[calc(100vh-0px)] bg-background text-foreground">
      <section className="mx-auto max-w-5xl px-gutter py-16 md:py-24">
        <div className="space-y-6">
          <h1 className="text-display-xl sm:text-display-2xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-gary-primary to-gary-secondary bg-clip-text text-transparent">
              Fubs
            </span>
          </h1>
          <p className="max-w-2xl text-body-lg text-muted-foreground">
            Project management for fast-moving teams. Plan roadmaps, run
            sprints, and track delivery in one place.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg bg-gary-primary px-6 py-3 text-body font-medium text-gary-primary-foreground transition-colors hover:bg-gary-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gary-accent"
            >
              Create your account
            </Link>
            <Link
              href="/plans"
              className="inline-flex items-center justify-center rounded-lg border border-muted bg-transparent px-6 py-3 text-body font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gary-accent"
            >
              Explore plans
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-gutter pb-16 md:pb-24">
        <h2 className="mb-6 text-heading-2">Everything you need to deliver</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            title="Workspaces & Projects"
            body="Organize initiatives by workspace and project with clear ownership."
          />
          <FeatureCard
            title="Tasks & Subtasks"
            body="Break work down, assign owners, set due dates, and track statuses."
          />
          <FeatureCard
            title="Roadmaps & Milestones"
            body="Visualize timelines and keep stakeholders aligned on outcomes."
          />
          <FeatureCard
            title="Permissions & Roles"
            body="Control access with role-based permissions at workspace and project levels."
          />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-gutter pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-muted bg-muted/40 p-5">
            <div className="mb-2 text-sm text-muted-foreground">Step 1</div>
            <h3 className="text-heading-3">Create your account</h3>
            <p className="mt-2 text-body text-muted-foreground">
              Get started free. Invite teammates anytime.
            </p>
          </div>
          <div className="rounded-xl border border-muted bg-muted/40 p-5">
            <div className="mb-2 text-sm text-muted-foreground">Step 2</div>
            <h3 className="text-heading-3">Pick a plan</h3>
            <p className="mt-2 text-body text-muted-foreground">
              Choose the features you need. Upgrade as you grow.
            </p>
          </div>
          <div className="rounded-xl border border-muted bg-muted/40 p-5">
            <div className="mb-2 text-sm text-muted-foreground">Step 3</div>
            <h3 className="text-heading-3">Start shipping</h3>
            <p className="mt-2 text-body text-muted-foreground">
              Plan roadmaps, run sprints, and track work across teams.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
