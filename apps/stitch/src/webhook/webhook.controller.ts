import {
  Controller,
  Post,
  Req,
  Res,
  Headers,
  HttpCode,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { PaymentsService } from '../payment/payments.service';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly webhookService: WebhookService
  ) {}

  @Post('stripe-dev')
  @HttpCode(200)
  async handleStripeWebhookDev(@Req() req: Request, @Res() res: Response) {
    /*
     * Use this endpoint for local development with the Stripe CLI
     * and testing webhooks without needing to validate signatures.
     */
    try {
      await this.webhookService.handleStripeEvent(req.body as any);
      return res.json({ received: true });
    } catch (err) {
      const isUnauthorized = err instanceof UnauthorizedException;
      if (!isUnauthorized) {
        this.logger.error('Unexpected error handling Stripe webhook', err);
      }
      throw err;
    }
  }

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
}
