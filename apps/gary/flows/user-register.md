## Feature 01 — Register User (SSR-first, App Router)

Goal

- Allow a visitor to create an account via users-service; optionally sign in immediately.

Contract (users-service)

- Register: POST `${USERS_SERVICE_URL}/api/users/register/`
  - body: { username: string; email: string; password: string }
  - 201/200 success; 4xx with field errors otherwise

Routing (App Router)

- `src/app/(public)/register/page.tsx` — server component with form
- `src/app/(public)/register/actions.ts` — `registerAction` ('use server')
- Optional `error.tsx` for friendly fallback

Flow (SSR)

- Server Action validates input (zod), calls users-service register.
- On success: redirect to `/login?registered=1` (default)
- On failure: map field errors and re-render the form with inline errors.

Typing

```TS
/// typing
interface RegisterRequest {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    password_confirm: string;
    type: "owner" | "admin" | "member";
}

// example
{
    "first_name": "owner456",
    "last_name": "last",
    "password_confirm": "owner456",
    "email": "owner456@owner.com",
    "password": "owner456",
    "type": "owner"
  }
```

Validation (zod)

- Parse server error payloads; surface field-level messages.

Auth & cookies

- If auto-login enabled, set HttpOnly cookie (e.g., `auth_token`) in the Server Action via `cookies().set(...)` with Secure/SameSite=Lax.
- Never expose JWT to client JS; all service calls are server-side.

Edge cases

- Duplicate email/username, weak password, network errors/timeouts, service down.

Tests

- Unit: zod schema, error mapper.
- E2E (Playwright): success redirect; duplicate email shows inline error; optional auto-login sets cookie and lands on onboarding.

Env

- `USERS_SERVICE_URL` (e.g., http://localhost:8000)
- Optional: `AUTH_COOKIE_NAME`, `AUTH_COOKIE_MAX_AGE`.

Open decision

- Auto-login after register? Default: off (explicit login), can be toggled later.

## End-to-end Onboarding Workflow (Register → Plan → Checkout → Access)

Requirements coverage

- Create account on users-service → Steps 1–2
- Auto-login after register → Step 2
- Redirect to choose a plan from stitch-service → Step 3
- Pay on checkout session for paid plans → Step 4
- Access features when entitled → Steps 5–6

High-level steps

1. Register (Server Action)

- Route: `src/app/(public)/register/page.tsx` with `registerAction` in `actions.ts` ('use server').
- Call `POST ${USERS_SERVICE_URL}/api/users/internal/register/` with { first_name, last_name, email, password, password_confirm, type }.
- Handle 4xx field errors; re-render with inline messages.

2. Auto-login (Server Action)

- Immediately call `POST ${USERS_SERVICE_URL}/api/users/login/` with { email, password }.
- On success, set HttpOnly cookie (e.g., `auth_token`) via `cookies().set(...)` (Secure, SameSite=Lax, Path=/).
- Redirect to `/plans`.

3. Choose Plan (SSR list from Stitch)

- Route: `src/app/(onboarding)/plans/page.tsx` (server component).
- Fetch `GET ${STITCH_SERVICE_URL}/plans` and render Free vs Paid cards.
- Action: `choosePlanAction(planId)` in `src/app/(onboarding)/plans/actions.ts`.
  - If selected plan is FREE: proceed to Step 5 (see note below).
  - If PAID: create checkout session (Step 4).

4. Create Checkout Session (Server Action → Redirect)

- Call `POST ${STITCH_SERVICE_URL}/checkout/session` with { priceId, successUrl, cancelUrl, ownerId }.
  - successUrl: `${APP_URL}/checkout/success?session_id={SESSION_ID}`
  - cancelUrl: `${APP_URL}/checkout/cancel`
- Receive { id, url } and `redirect(url)` to provider (Stripe-hosted checkout).
- After payment, provider redirects back to success/cancel.

5. Success/Cancel Handling (Verify + Entitlement)

- Routes:
  - `src/app/(onboarding)/checkout/success/page.tsx` (server)
  - `src/app/(onboarding)/checkout/cancel/page.tsx` (server)
- Success page reads `session_id` from `searchParams` and calls `GET ${STITCH_SERVICE_URL}/checkout/session/:id` to confirm.
- Then poll/read entitlement: `GET ${STITCH_SERVICE_URL}/entitlements/me`.
  - If ACTIVE (or FREE), redirect to `/app` (home/dashboard).
  - If not yet active (webhook delay), show a transient “finalizing purchase” screen and retry briefly.

6. Access Control (Middleware + Server Guards)

- `src/middleware.ts`:
  - If no `auth_token` → redirect to `/login`.
  - If path under `/app` and entitlement not ACTIVE/FREE → redirect to `/plans`.
- Server-only utility `src/server/entitlements.ts` wraps Stitch calls; use from RSC to gate content.

Notes & TODOs (Stitch dependencies)

- Implement in Stitch:
  - `POST /checkout/session` → returns { id, url }.
  - `GET /checkout/session/:id` → returns session status.
  - `GET /entitlements/me` → returns current user entitlement (status, planType, expiresAt).
  - Optional: `POST /entitlements/free` to assign FREE plan explicitly; until then, treat FREE as allowed without remote record.
- Plans already exist at `GET /plans` (see Stitch PlansController).

Validation & errors

- zod on server for register/choose plan.
- Map users-service 4xx payloads to field errors (email taken, weak password, etc.).
- Friendly error UI; never expose secrets or raw provider messages.

Security

- Keep JWT only in HttpOnly cookie; never in client JS.
- Idempotency key when creating checkout sessions (pass a UUID header).
- Build success/cancel URLs from server-side APP_URL; validate `session_id` shape.

Environment

- `USERS_SERVICE_URL` (e.g., http://localhost:8000)
- `STITCH_SERVICE_URL` (e.g., http://localhost:4001)
- `APP_URL` (e.g., http://localhost:4002) for return URLs
- `AUTH_COOKIE_NAME` (default `auth_token`), `AUTH_COOKIE_MAX_AGE`

Testing

- Unit: zod schemas, error mappers, server utilities.
- E2E (Playwright):
  - Register → auto-login → plans list shown.
  - FREE plan → lands in `/app` and content visible.
  - PAID plan → redirected to checkout, back to success, entitlement becomes ACTIVE, then `/app`.
