import {
  PaymentProvider,
  Customer,
  Product,
  Price,
  CheckoutSession,
  Subscription,
} from './payment-provider.interface';

describe('PaymentProvider Interface', () => {
  it('should define all required methods', () => {
    // This test ensures the interface is properly defined
    // We're not testing implementation, just interface structure

    const mockProvider: PaymentProvider = {
      // Customer Management
      createCustomer: jest.fn(),
      getCustomer: jest.fn(),

      // Product Management
      createProduct: jest.fn(),
      getProduct: jest.fn(),

      // Price Management
      createPrice: jest.fn(),
      getPrice: jest.fn(),

      // Checkout Management
      createCheckoutSession: jest.fn(),
      getCheckoutSession: jest.fn(),

      // Subscription Management
      createSubscription: jest.fn(),
      getSubscription: jest.fn(),
      updateSubscription: jest.fn(),
      cancelSubscription: jest.fn(),

      // Invoice Management
      getInvoice: jest.fn(),
      getInvoicesByCustomer: jest.fn(),

      // Webhook Management
      validateWebhook: jest.fn(),

      // Search and List Operations
      searchSubscriptions: jest.fn(),
      getSubscriptionsByCustomer: jest.fn(),
    };

    expect(mockProvider).toBeDefined();
    expect(typeof mockProvider.createCustomer).toBe('function');
    expect(typeof mockProvider.createProduct).toBe('function');
    expect(typeof mockProvider.createCheckoutSession).toBe('function');
    expect(typeof mockProvider.createSubscription).toBe('function');
  });

  it('should have proper type definitions for entities', () => {
    const customer: Customer = {
      id: 'cus_123',
      email: 'test@example.com',
      name: 'Test User',
      metadata: { ownerId: 'owner_123' },
    };

    const product: Product = {
      id: 'prod_123',
      name: 'Test Product',
      description: 'Test Description',
      metadata: { planType: 'SOLO' },
    };

    const price: Price = {
      id: 'price_123',
      productId: 'prod_123',
      unitAmount: 1000,
      currency: 'usd',
      recurring: { interval: 'month' },
    };

    const checkoutSession: CheckoutSession = {
      id: 'cs_123',
      customerId: 'cus_123',
      priceId: 'price_123',
      status: 'open',
      url: 'https://checkout.stripe.com/...',
      metadata: { ownerId: 'owner_123' },
    };

    const subscription: Subscription = {
      id: 'sub_123',
      customerId: 'cus_123',
      priceId: 'price_123',
      status: 'active',
      metadata: { ownerId: 'owner_123' },
      currentPeriodEnd: new Date(),
    };

    expect(customer.id).toBe('cus_123');
    expect(product.name).toBe('Test Product');
    expect(price.unitAmount).toBe(1000);
    expect(checkoutSession.status).toBe('open');
    expect(subscription.status).toBe('active');
  });
});
