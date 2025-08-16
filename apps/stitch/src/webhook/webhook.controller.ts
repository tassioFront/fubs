import {
  Controller,
  Post,
  Req,
  Res,
  Headers,
  HttpCode,
  Logger,
  UnauthorizedException,
  Body,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { StripeService } from '../common/stripe/stripe.service';
import { WebhookService } from './webhook.service';
import type {
  CreateCheckoutSessionDto,
  CreateCustomerDto,
} from '../common/stripe/stripe.entity';

@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly webhookService: WebhookService
  ) {}

  @Post('stripe')
  @HttpCode(200)
  async handleStripeWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string
  ) {
    let event;
    try {
      event = this.stripeService.validateWebhookSignature(
        (req as unknown as { rawBody: Buffer }).rawBody,
        signature
      );
      await this.webhookService.handleStripeEvent(event);
      return res.json({ received: true });
    } catch (err) {
      const isUnauthorized = err instanceof UnauthorizedException;
      if (!isUnauthorized) {
        this.logger.error('Unexpected error handling Stripe webhook', err);
      }
      return err;
    }
  }

  @Post('test-checkout-url')
  async createTestCheckoutUrl(@Body() dto: CreateCheckoutSessionDto) {
    const session = await this.stripeService.createCheckoutSession(dto);
    return { url: session.url };
  }

  @Post('test-customer')
  async createTestCustomer(@Body() dto: CreateCustomerDto) {
    const customer = await this.stripeService.createCustomer(dto);
    return { id: customer.id };
  }
}
