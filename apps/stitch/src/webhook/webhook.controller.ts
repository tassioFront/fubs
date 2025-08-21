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
  Get,
  Param,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { PaymentsService } from '../common/stripe/payments.service';
import { WebhookService } from './webhook.service';
import type {
  CreateCheckoutSessionDto,
  CreateCustomerDto,
} from '../common/stripe/stripe.entity';

@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly webhookService: WebhookService
  ) {}

  @Post('stripe')
  @HttpCode(200)
  async handleStripeWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string
  ) {
    try {
      const event = await this.paymentsService.validateWebhookSignature(
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
      throw err;
    }
  }

  @Post('test-checkout-url')
  async createTestCheckoutUrl(@Body() dto: CreateCheckoutSessionDto) {
    const session = await this.paymentsService.createCheckoutSession(dto);
    return { url: (session as unknown as { url?: string }).url };
  }

  @Post('test-customer')
  async createTestCustomer(@Body() dto: CreateCustomerDto) {
    const customer = await this.paymentsService.createCustomer(dto);
    return { id: customer.id };
  }

  @Get('test-subscriptions/:ownerId')
  async getTestSubscriptions(@Param('ownerId') ownerId: string) {
    const subscriptions = await this.paymentsService.getSubscriptionsByOwnerId(
      ownerId
    );
    return { subscriptions };
  }
}
