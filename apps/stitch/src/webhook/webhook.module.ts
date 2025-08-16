import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { StripeService } from '../common/stripe/stripe.service';

@Module({
  imports: [ConfigModule],
  controllers: [WebhookController],
  providers: [WebhookService, StripeService],
  exports: [WebhookService],
})
export class WebhookModule {}
