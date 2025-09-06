import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebhookModule } from '../webhook/webhook.module';
import { PlansModule } from '../plans/plans.module';
import { OutboxProcessorModule } from '../outbox/outbox.module';
import { CustomerModule } from '../customer/customer.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { AuthModule } from '../common/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    WebhookModule,
    PlansModule,
    OutboxProcessorModule,
    CustomerModule,
    SubscriptionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
