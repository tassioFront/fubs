export class OrderEntity {
  id: string;
  ownerId: string;
  planType: 'FREE' | 'SOLO' | 'ENTERPRISE';
  amount: string; // Decimal as string for precision
  currency: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'EXPIRED';
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;

  // Computed properties
  get isActive(): boolean {
    return this.status === 'PAID' && this.expiresAt > new Date();
  }

  get isExpired(): boolean {
    return this.expiresAt <= new Date();
  }
}
