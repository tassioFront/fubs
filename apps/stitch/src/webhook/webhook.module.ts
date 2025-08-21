import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { PaymentsService } from '../common/stripe/payments.service';
import { PaymentModule } from '../common/payment/payment.module';

@Module({
  imports: [ConfigModule, PaymentModule],
  controllers: [WebhookController],
  providers: [WebhookService, PaymentsService],
  exports: [WebhookService],
})
export class WebhookModule {}
