import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PlansService } from './plans.service';
import { PlansController } from './plans.controller';
import { PaymentsService } from '../common/stripe/payments.service';
import { PaymentModule } from '../common/payment/payment.module';

@Module({
  imports: [ConfigModule, PaymentModule],
  providers: [PlansService, PaymentsService],
  controllers: [PlansController],
  exports: [PlansService],
})
export class PlansModule {}
