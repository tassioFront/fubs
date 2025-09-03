import { Injectable, Logger } from '@nestjs/common';
import { PaymentsService } from '../payment/payments.service';
import type { WebhookEvent } from '../payment';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  async handleStripeEvent(event: WebhookEvent): Promise<void> {
    switch (event.type) {
      case 'invoice.paid':
        await this.paymentsService.handleInvoicePaid(event);
        break;
      case 'invoice.payment_failed':
        await this.paymentsService.handleInvoicePaymentFailed(event);
        break;
      case 'customer.subscription.created':
        await this.paymentsService.handleSubscriptionCreated(event);
        break;
      case 'customer.subscription.updated':
        await this.paymentsService.handleSubscriptionUpdated(event);
        break;
      case 'customer.subscription.deleted':
        await this.paymentsService.handleSubscriptionDeleted(event);
        break;
      case 'checkout.session.completed':
        await this.paymentsService.handleCheckoutSessionCompleted(event);
        break;
      default:
        this.logger.warn(`Unhandled Stripe event type: ${event.type}`);
    }
  }
}
