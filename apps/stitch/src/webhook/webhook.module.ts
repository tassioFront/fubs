import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { PaymentsService } from '../payment/payments.service';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [ConfigModule, PaymentModule],
  controllers: [WebhookController],
  providers: [WebhookService, PaymentsService],
  exports: [WebhookService],
})
export class WebhookModule {}
