import { Module } from '@nestjs/common';
import { PAYMENT_PROVIDER } from './payment-provider.interface';
import { StripeAdapterService } from './stripe-adapter.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../common/prisma.service';

/**
 * Payment Module
 *
 * This module provides payment functionality through a provider-agnostic interface.
 * It selects the provider at runtime based on configuration (default: stripe).
 */
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [
    PrismaService,
    StripeAdapterService,
    PaymentsService,
    {
      provide: PAYMENT_PROVIDER,
      inject: [ConfigService, StripeAdapterService], // it can have multiple providers
      useFactory: async (
        config: ConfigService,
        stripe: StripeAdapterService
      ) => {
        const provider = (
          config.get<string>('PAYMENT_PROVIDER_KEY') || 'stripe'
        ).toLowerCase();
        switch (provider) {
          case 'stripe':
          default:
            return stripe;
        }
      },
    },
  ],
  exports: [
    PrismaService,
    StripeAdapterService,
    PaymentsService,
    PAYMENT_PROVIDER,
  ],
})
export class PaymentModule {}
