import {
  IsOptional,
  IsString,
  IsUUID,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { SubscriptionStatus, PlanType } from '@prisma/client-stitch';

export class GetSubscriptionsQueryDto {
  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @IsOptional()
  @IsEnum(PlanType)
  planType?: PlanType;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 50;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  offset?: number = 0;
}

export class SubscriptionResponseDto {
  id: string;
  ownerId: string;
  planType: PlanType;
  paymentProviderCustomerId?: string;
  paymentProviderSubscriptionId?: string;
  paymentProviderPriceId?: string;
  status: SubscriptionStatus;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class CreateSubscriptionEntitlementDto {
  @IsString()
  @IsUUID()
  ownerId: string;

  @IsEnum(PlanType)
  planType: PlanType;

  @IsOptional()
  @IsString()
  paymentProviderCustomerId?: string;

  @IsOptional()
  @IsString()
  paymentProviderSubscriptionId?: string;

  @IsOptional()
  @IsString()
  paymentProviderPriceId?: string;

  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @IsOptional()
  @IsDateString()
  expiresAt: string;
}
