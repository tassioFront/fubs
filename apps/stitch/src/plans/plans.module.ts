import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PlansService } from './plans.service';
import { PlansController } from './plans.controller';
import { PaymentsService } from '../payment/payments.service';
import { PaymentModule } from '../payment/payment.module';
import { CustomerService } from '../customer/customer.service';

@Module({
  imports: [ConfigModule, PaymentModule],
  providers: [PlansService, PaymentsService, CustomerService],
  controllers: [PlansController],
  exports: [PlansService],
})
export class PlansModule {}
