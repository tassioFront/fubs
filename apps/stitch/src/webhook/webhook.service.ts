import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { StripeService } from '../common/stripe/stripe.service';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(private readonly stripeService: StripeService) {}

  async handleStripeEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'invoice.paid':
        await this.stripeService.handleInvoicePaid(event);
        break;
      case 'invoice.payment_failed':
        await this.stripeService.handleInvoicePaymentFailed(event);
        break;
      case 'customer.subscription.created':
        await this.stripeService.handleSubscriptionCreated(event);
        break;
      case 'customer.subscription.updated':
        await this.stripeService.handleSubscriptionUpdated(event);
        break;
      case 'customer.subscription.deleted':
        await this.stripeService.handleSubscriptionDeleted(event);
        break;
      case 'checkout.session.completed':
        await this.stripeService.handleCheckoutSessionCompleted(event);
        break;
      default:
        this.logger.warn(`Unhandled Stripe event type: ${event.type}`);
    }
  }
}
