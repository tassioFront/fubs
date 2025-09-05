import { Injectable, Logger } from '@nestjs/common';
// import { PaymentsService } from '../payment/payments.service';
import { SubscriptionService } from '../subscription/subscription.service';
// import type { WebhookEvent } from '../payment';
import Stripe from 'stripe';
import { WebhookEvent } from '../payment/payment-provider.interface';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    // private readonly paymentsService: PaymentsService,
    private readonly subscriptionService: SubscriptionService
  ) {}

  async handleStripeEvent(event: WebhookEvent): Promise<void> {
    switch (event.type) {
      // case 'invoice.paid':
      //   await this.paymentsService.handleInvoicePaid(event);
      //   break;
      // case 'invoice.payment_failed':
      //   await this.paymentsService.handleInvoicePaymentFailed(event);
      //   break;
      case 'customer.subscription.created':
        await this.subscriptionService.handleSubscriptionCreated(
          event.data as Stripe.Subscription
        );
        break;
      case 'customer.subscription.updated':
        await this.subscriptionService.handleSubscriptionUpdated(
          event.data as Stripe.Subscription
        );
        break;
      case 'customer.subscription.deleted':
        await this.subscriptionService.handleSubscriptionDeleted(
          event.data as Stripe.Subscription
        );
        break;
      // case 'checkout.session.completed':
      //   await this.paymentsService.handleCheckoutSessionCompleted(event);
      //   break;
      default:
        this.logger.warn(`Unhandled Stripe event type: ${event.type}`);
    }
  }
}
