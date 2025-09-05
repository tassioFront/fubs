import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { PaymentModule } from '../payment/payment.module';
import { PrismaService } from '../common/prisma.service';
import { CustomerService } from 'src/customer/customer.service';

@Module({
  imports: [PaymentModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService, PrismaService, CustomerService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
