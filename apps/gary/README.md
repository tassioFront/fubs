<div align='center'>
  
<img width="200" alt="Gary logo" src="https://github.com/user-attachments/assets/30413105-2015-4064-b680-ef3f7f5ba80a" />
</div>

<br/>

[Gary](https://upload.wikimedia.org/wikipedia/commons/4/4a/Gary_%28SpongeBob%29_character.png) is the frontend app of the Fubs monorepo. It will be used for clients to use the Fubs platform.

Purpose

- Ship a server-first web app consuming sugarfoot-service and stitch-service.
- Optimize SSR with the App Router while minimizing client-side JS.
- Fit cleanly into the Nx monorepo.

Principles

- App Router by default (app/). Prefer server-rendered routes and server code.
- Avoid client components and 'use client' unless interactivity is required.
- Strict TypeScript and runtime validation at boundaries.

Core Tech

- Framework: Next.js 15 (App Router, Route Handlers, Streaming)
- Language: TypeScript (strict: true)
- Styling: Tailwind CSS + CSS Modules
- Forms/Mutations: Server Actions (primary) with Route Handlers fallback
- Validation: zod for server responses and form payloads
- Auth: HTTP-only JWT cookie verified in middleware and server utilities (jose/JWKS)
- Testing: Jest + Testing Library (unit) and Playwright (e2e) + Axe for a11y
- Monorepo: Nx with @nx/next; shared types/utilities in libs/

Rendering Defaults

- User-specific pages: dynamic render (`export const dynamic = 'force-dynamic'`) or `cache: 'no-store'`.
- Semi-static data: `revalidate` interval and tag-based revalidation after mutations.
- Use Suspense boundaries to stream slow sections when beneficial.

Server-only Data Layer

- Thin “server SDK” per backend (sugarfoot, stitch) marked with `server-only`.
- Concerns: base URL from env, auth cookie/header forwarding, retries/backoff, zod parsing, error mapping.

```ts
// server-only SDK example
import 'server-only';
import { cookies } from 'next/headers';
import { z } from 'zod';

const Workspace = z.object({ id: z.string(), name: z.string() });
export type Workspace = z.infer<typeof Workspace>;

export async function listWorkspaces(): Promise<Workspace[]> {
  const cookieHeader = cookies().toString();
  const res = await fetch(`${process.env.SERVICE_SUGARFOOT_URL}/workspaces`, {
    headers: { cookie: cookieHeader },
    // For dashboards, consider forcing dynamic or using short revalidate + tags
    next: { revalidate: 60, tags: ['workspaces'] },
  });
  if (!res.ok) throw new Error(`Failed: ${res.status}`);
  return z.array(Workspace).parse(await res.json());
}
```

Forms and Mutations

- Prefer Server Actions from RSC pages/forms (no client lib).
- After mutations, call `revalidateTag('...')` or `revalidatePath('...')`.
- Fallback to Route Handlers when Server Actions are not suitable.

Auth

- middleware.ts validates presence of JWT cookie and redirects unauthenticated users.
- Verify tokens on the server (jose/JWKS). Never expose secrets via NEXT_PUBLIC.
- Forward auth via cookies/headers only on server fetches.

Styling and UI

- Tailwind utilities for layout/spacing; CSS Modules for complex components.
- Accessible, semantic HTML; hydrate only when interactivity is required.

Performance

- Keep client bundles minimal.
- Profile with `next build` and Nx task stats.
- Use next/image for optimized media.

Environment

- SERVER: SERVICE_SUGARFOOT_URL, SERVICE_STITCH_URL, JWT_AUDIENCE/ISSUER, JWKS_URL
- CLIENT (public): only stable, non-sensitive values

Nx Integration Quick Plan

- Scaffold apps/gary via @nx/next (App Router)
- Add Tailwind via Nx generator
- Reuse libs/shared for types and utilities
- Configure targets: build, serve, test, e2e with caching
