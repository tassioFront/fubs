import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PlansService } from './plans.service';
import { PlansController } from './plans.controller';
import { StripeService } from '../common/stripe/stripe.service';

@Module({
  imports: [ConfigModule],
  providers: [PlansService, StripeService],
  controllers: [PlansController],
  exports: [PlansService],
})
export class PlansModule {}
