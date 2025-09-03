# Subscription Entitlements Strategy

This document defines when and how the Stitch service persists and updates subscription state in its database, using the `SubscriptionEntitlement` model as a fast, reliable cache of billing status.

## Goals

- The Payment Provider (current Stripe) remains the billing source of truth
- Local cache used for fast access checks and decoupling from Provider availability/latency
- Idempotent, event-driven updates via Provider webhooks
- Clear status and expiry semantics for authorization logic

## Data Model (local cache)

- `SubscriptionEntitlement`
  - `ownerId: string` (links to your user/workspace owner)
  - `planType: PlanType` (FREE | SOLO | ENTERPRISE)
  - `stripeCustomerId?: string`
  - `stripeSubscriptionId?: string (unique)`
  - `stripePriceId?: string`
  - `status: SubscriptionStatus` (mapped from Payment Provider)
  - `expiresAt: Date` (current period end)
  - `createdAt`, `updatedAt`
- `WebhookEvent` (dedupe/observability)
- `Outbox` (event-driven integration to other services)
- `Plan` (local plan catalog + Payment Provider price/product mapping)

## When to Write to DB (it is considering Stripe events)

we should confirm the Stripe events order and than define the status per event

1. checkout.session.completed

- Purpose: Seed entitlement as soon as checkout completes
- Action: Upsert entitlement with owner metadata and Payment ProviderIDs
- Fields: `ownerId`, `stripeCustomerId`, `stripeSubscriptionId`, `stripePriceId`, `status = INCOMPLETE` (or ACTIVE if you already see it active), `expiresAt` = temporary until subscription snapshot arrives <!-- define the status -->
- Also: Update subscription metadata in Payment Providerwith `ownerId` (so future events carry it)

2. invoice.paid

- Purpose: Confirm active paid period
- Action: Upsert entitlement to `ACTIVE` <!-- define the status -->
- Fields: Set `status = ACTIVE`, `stripePriceId`, `expiresAt = current_period_end`, ensure `stripeSubscriptionId` and `stripeCustomerId` are set
- Emit outbox: `PLAN_PURCHASED` or `ENTITLEMENT_UPDATED`

3. customer.subscription.updated

- Purpose: Sync on any plan/status/period changes
- Action: Upsert entitlement with Payment Providersnapshot
- Fields: Map Payment Providerstatus → local `SubscriptionStatus`, update `stripePriceId`, `expiresAt = current_period_end`
- Emit outbox: `ENTITLEMENT_UPDATED` if anything changed

4. invoice.payment_failed

- Purpose: Reflect billing problems
- Action: Update entitlement `status = PAST_DUE` (keep `expiresAt` unless policy differs)
- Emit outbox: `PAYMENT_FAILED`

5. customer.subscription.deleted

- Purpose: End access
- Action: Update entitlement `status = CANCELED`; set `expiresAt = now()` (or keep prior end if you honor remaining time)
- Emit outbox: `ENTITLEMENT_REVOKED`

6. Manual changes (cancel/upgrade/downgrade)

- Call Payment Providerfirst, then mirror state locally using the same rules as (3)

7. Reconciliation job (periodic)

- Nightly (or hourly) reconcile ACTIVE/PAST_DUE entitlements against Stripe
- Correct drift in `status`, `stripePriceId`, `expiresAt`

## What Not to Write

- Product/price/customer creation events
- `checkout.session.expired` (unless cleaning placeholders)
- Unrelated Payment Providerevents

## Status Mapping (Payment Provider→ Local)

- trialing → TRIALING
- active → ACTIVE
- past_due → PAST_DUE
- canceled → CANCELED
- unpaid → UNPAID
- incomplete → INCOMPLETE
- incomplete_expired → INCOMPLETE_EXPIRED
- paused → PAUSED

## Idempotency & Ordering

- Store and dedupe by Payment Provider`event.id` in `WebhookEvent`
- Process in `receivedAt` order for deterministic effects
- All handlers must be idempotent “upsert” operations keyed by `stripeSubscriptionId` (preferred) or `ownerId`

## Access Check Contract

- Allow if: `status == ACTIVE` AND `expiresAt > now()`
- Optional grace policy for `PAST_DUE`
- FREE plan: either no entitlement needed, or a synthetic entitlement with `planType = FREE`

## Typical Queries

```ts
// Access check
await prisma.subscriptionEntitlement.findUnique({ where: { ownerId } });

// Expiring soon
await prisma.subscriptionEntitlement.findMany({
  where: { status: 'ACTIVE', expiresAt: { lt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) } },
  orderBy: { expiresAt: 'asc' },
});

// Resolve plan for checkout
await prisma.plan.findFirst({ where: { type: 'SOLO' } });

// Webhook dequeue
await prisma.webhookEvent.findMany({
  where: { processed: false },
  orderBy: { receivedAt: 'asc' },
  take: 100,
});
```

## Failure Handling

- Retry transient failures (network/Payment Providertimeouts)
- Leave webhook event `processed = false` for retry; ensure handlers are idempotent
- Log with enough context: `event.id`, `ownerId`, `stripeSubscriptionId`

## Testing Checklist

- Unit: status mapping, entitlement upsert logic, idempotency (same event twice)
- Integration: webhook signature validation, event routing, DB writes
- E2E: checkout → session completed → invoice paid → entitlement ACTIVE, then cancel → entitlement CANCELED

## Runbook

- If webhooks are delayed: access checks still succeed using last known `expiresAt`
- If drift detected: trigger reconciliation job for affected `ownerId`
- If Payment Providermetadata missing: fall back to customer metadata, then manual linkage if needed
