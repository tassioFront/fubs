import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CheckoutModule } from '../checkout/checkout.module';
import { WebhookModule } from '../webhook/webhook.module';
import { OrdersModule } from '../orders/orders.module';
import { PlansModule } from '../plans/plans.module';
import { OutboxModule } from '../outbox/outbox.module';
import { CustomerModule } from '../customer/customer.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { AuthModule } from '../common/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    CheckoutModule,
    WebhookModule,
    OrdersModule,
    PlansModule,
    OutboxModule,
    CustomerModule,
    SubscriptionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
