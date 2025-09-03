import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { PaymentModule } from '../payment/payment.module';
import { CustomerService } from './customer.service';

@Module({
  imports: [PaymentModule],
  providers: [CustomerService],
  controllers: [CustomerController],
})
export class CustomerModule {}
