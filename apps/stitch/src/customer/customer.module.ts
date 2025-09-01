import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [PaymentModule],
  controllers: [CustomerController],
})
export class CustomerModule {}
