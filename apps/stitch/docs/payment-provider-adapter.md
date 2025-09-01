## Payment Provider Adapter Pattern in Stitch

The Stitch service uses a **Payment Provider Adapter** pattern to abstract payment operations from specific providers (e.g., Stripe, PayPal). This enables the business logic to remain provider-agnostic and makes it easy to swap payment providers without major code changes.

### Key Concepts

- **PaymentProvider Interface**: Defines all required payment operations (customer, product, price, checkout, subscription, invoice, webhook handling).
- **StripeAdapterService**: Implements the PaymentProvider interface for Stripe, mapping Stripe resources to the domain models.
- **Decoupling**: Business logic interacts only with the PaymentProvider interface, not directly with Stripe or other providers.

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

### Example Structure

```
apps/stitch/src/
	customer/
		customer.module.ts
		customer.controller.ts
	product/
		product.module.ts
		product.controller.ts
	checkout/
		checkout.module.ts
		checkout.controller.ts
	subscription/
		subscription.module.ts
		subscription.controller.ts
	order/
		order.module.ts
		order.controller.ts
	payment/ // it will be moved to common folder later
		payment-provider.interface.ts
		stripe-adapter.service.ts
		payment.service.ts
		payments.module.ts
```

Each controller should use the relevant methods from `payment.service` to interact with the payment provider, keeping business logic centralized and maintainable.

## Step 1 - Customer

- create the customer folder
- create the customer module in (it should inject the PaymentService as payment.module does)
- create the customer controller
- move the customer-related logic from payment.service.ts to customer.service.ts
- create the necessary customer-related endpoints on customer.controller.ts
- create the necessary customer-related DTOs (Data Transfer Objects) for request validation and type safety
