## Payment Provider Adapter Pattern in Stitch

The Stitch service uses a **Payment Provider Adapter** pattern to abstract payment operations from specific providers (e.g., Stripe, PayPal). This enables the business logic to remain provider-agnostic and makes it easy to swap payment providers without major code changes.

### Key Concepts

- **PaymentProvider Interface**: Defines all required payment operations (customer, product, price, checkout, subscription, invoice, webhook handling).
- **StripeAdapterService**: Implements the PaymentProvider interface for Stripe, mapping Stripe resources to the domain models.
- **Decoupling**: Business logic interacts only with the PaymentProvider interface, not directly with Stripe or other providers.
- **Local Persistence**: All business-critical entities (e.g., customer) should be persisted in the local database, with references to the provider-specific IDs (e.g., `stripeCustomerId`). This ensures resilience, auditability, and provider-agnostic business logic.

---

## Entity Splitting Strategy

To improve maintainability and scalability, payment-related entities should be split into focused modules/controllers. Instead of placing all controllers in the `payment` folder, create dedicated folders for each domain (e.g., customer, product, checkout, subscription, order) and build real NestJS modules for each domain. For payment provider operations, use the existing `payment.service` abstraction, which centralizes all payment logic and interacts with the payment provider adapter. This approach supports clear boundaries, easier testing, and future extensibility without duplicating service logic.

### Recommended Entities & Services

- **CustomerController**: Uses `payment.service` methods for customer operations.
- **ProductController**: Uses `payment.service` methods for product and price management.
- **CheckoutController**: Uses `payment.service` methods for checkout flows.
- **SubscriptionController**: Uses `payment.service` methods for subscription lifecycle.
- **OrderController**: Uses `payment.service` methods for payment transactions and audit trails.
- **WebhookController**: Uses `payment.service` methods for webhook processing and validation.

### Example: Subscription

### Structure

```
apps/stitch/src/
	subscription/
		subscription.module.ts
		subscription.controller.ts
		subscription.service.ts
		dto/
			subscription.dto.ts
	payment/ // it will be moved to common folder later
		payment-provider.interface.ts
		stripe-adapter.service.ts
		payment.service.ts
		payments.module.ts
```

Each controller should use the relevant methods from `payment.service` to interact with the payment provider, keeping business logic centralized and maintainable.

### steps

- create the subscription folder
- create the subscription module in (it should inject the PaymentService as payment.module does)
- create the subscription controller
- move the subscription-related logic from webhook.service.ts to subscription.service.ts
- the webhook.service.ts should use the subscription.service.ts methods for subscription-related webhook events
- create the following subscription-related endpoints on subscription.controller.ts: get all subscriptions and get subscription by id
- create the necessary subscription-related DTOs (Data Transfer Objects) for request validation and type safety
- use the local subscription model on schema that stores business data and references the provider’s subscription
- use the JwtAuthGuard guard to protect all subscription-related endpoints
- remove processPlanPayment from payment.service, as it is no longer needed. Treat the subscription synchronization on the subscription.service.ts

## Subscription context

- subscription.service can NOT call stripe directly. It should use payment.service methods to interact with the payment provider if needed.
- Subscription is a business entity that represents a recurring payment agreement between a customer and the service.
- The subscription created, updated and deleted events comes from the payment provider via webhooks.
- SUBSCRIPTION_CREATED: when emitted, the subscription service should create a new subscription in the local database, referencing the provider's subscription ID, customer ID and Price ID.
- SUBSCRIPTION_UPDATED: when emitted, the subscription service should update the local subscription record to reflect changes made in the payment provider (e.g., status, plan).
- SUBSCRIPTION_DELETED: when emitted, the subscription service should mark the local subscription as cancelled or deleted, depending on business rules.
