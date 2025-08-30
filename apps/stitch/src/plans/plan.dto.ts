import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlanType } from '@fubs/shared';

export class CreatePlanDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  type: PlanType;

  @ApiProperty({ example: 'Solo' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Up to 3 workspaces' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 990 })
  @IsInt()
  priceCents: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  workspaceLimit: number | null;

  @ApiProperty({
    example: ['3 workspaces', 'Priority support', 'Advanced features'],
  })
  @IsArray()
  @IsString({ each: true })
  features: string[];

  @ApiProperty({ example: 'month' })
  @IsString()
  billingPeriod: string;

  @ApiPropertyOptional({ example: 'prod_123' })
  @IsOptional()
  @IsString()
  stripeProductId?: string;

  @ApiPropertyOptional({ example: 'price_123' })
  @IsOptional()
  @IsString()
  stripePriceId?: string;
}

export class UpdatePlanDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  priceCents?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  workspaceLimit: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  billingPeriod?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stripeProductId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stripePriceId?: string;
}

export class PlanOutputDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  type!: PlanType;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  priceCents: number;

  @ApiPropertyOptional()
  workspaceLimit: number | null;

  @ApiProperty()
  features: string[];

  @ApiProperty()
  billingPeriod: string;

  @ApiPropertyOptional()
  stripeProductId?: string | null;

  @ApiPropertyOptional()
  stripePriceId?: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(props: PlanOutputDto) {
    this.id = props.id;
    this.type = props.type;
    this.name = props.name;
    this.description = props.description;
    this.priceCents = props.priceCents;
    this.workspaceLimit = props.workspaceLimit;
    this.features = props.features;
    this.billingPeriod = props.billingPeriod;
    this.stripeProductId = props.stripeProductId;
    this.stripePriceId = props.stripePriceId;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}

export class PlanTypeParamDto {
  @IsEnum(PlanType)
  type: PlanType;
}

export class GetPricesByIdDto {
  @ApiProperty({
    description: 'Comma-separated list of price IDs',
    example: 'price_1,price_2,price_3',
  })
  @IsString()
  @IsNotEmpty()
  ids: string;

    return this.ids
      .split(',')
      .map(id => id.trim())
      .filter(id => id.length > 0);
  }
}
