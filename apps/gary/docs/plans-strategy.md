# Plans & Pricing Strategy (Gary + Stitch)

## Overview

This document describes the refined strategy for rendering plans and their prices in the Gary frontend, with all plan and price data managed by the Stitch backend service. The approach ensures clear boundaries, server-side data fetching, and adherence to the payment adapter pattern.

---

## Architecture

- **Gary (Frontend)**: Renders available plans and their prices. All plan and price data is fetched from Stitch via server-side requests.
- **Stitch (Backend)**: Owns all plan and price data. Exposes endpoints for Gary to fetch plans and price details. Delegates price fetching to the payment module using the adapter pattern.

---

## Flow

1. **Gary** requests all plans from Stitch (`GET /plans`).
2. **Stitch** receives the request, and the `PlansController` delegates to `PlansService`.
3. **PlansService** delegates to `PaymentsService`, which uses the payment provider adapter to fetch price details. The Plans details comes from plans schema - so it does not need to fetch from payment provider directly.
4. **Gary** receives enriched plan data (with price details) and renders plans and prices on the frontend.

---

# Step 1 ✅ COMPLETED

## Backend Implementation (Stitch)

- **Endpoint**: `GET /plans/prices-by-id?ids=<priceId1>,<priceId2>,...`
  - Accepts a comma-separated list of price IDs as query parameters.
  - Returns price details for each ID.
- **Controller**: `PlansController` delegates to `PlansService`.
- **Service**: `PlansService` delegates to `PaymentsService`.
- **Adapter Pattern**: `PaymentsService` uses the payment provider adapter to fetch price details, ensuring provider-agnostic logic.

---

# Step 2 ✅ COMPLETED

## Frontend Implementation (Gary)

- ✅ Fetch plans on the server using `getPlans()`.
- ✅ Extract all `priceId`s from the plans.
- ✅ Fetch price details using `getPlanPrices(priceIds)`.
- ✅ Merge price details into plan objects and render them in the UI.
