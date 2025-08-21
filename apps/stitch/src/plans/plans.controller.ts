import { PLANS } from './plans.config';
import { PaymentsService } from '../common/stripe/payments.service';
import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Patch,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';

import { PlansService } from './plans.service';
import {
  CreatePlanDto,
  UpdatePlanDto,
  PlanOutputDto,
  PlanTypeParamDto,
} from './plan.dto';

@Controller('plans')
export class PlansController {
  constructor(
    private readonly plansService: PlansService,
    private readonly paymentsService: PaymentsService
  ) {}

  @Get()
  async getAllPlans(): Promise<PlanOutputDto[]> {
    return this.plansService.getAllPlans();
  }

  @Get('type/:type')
  async getPlanByType(
    @Param('type')
    params: PlanTypeParamDto
  ): Promise<PlanOutputDto | null> {
    return this.plansService.getPlanByType(params.type);
  }

  @Get(':id')
  async getPlanById(
    @Param('id', new ParseUUIDPipe()) id: string
  ): Promise<PlanOutputDto> {
    return this.plansService.getPlanById(id);
  }

  @Post()
  async createPlan(@Body() dto: CreatePlanDto): Promise<PlanOutputDto> {
    return this.plansService.createPlan(dto);
  }

  @Patch(':id')
  async updatePlan(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdatePlanDto
  ): Promise<{ message: string }> {
    return this.plansService.updatePlan(id, dto);
  }

  @Delete(':id')
  async deletePlan(
    @Param('id', new ParseUUIDPipe()) id: string
  ): Promise<{ message: string }> {
    return this.plansService.deletePlan(id);
  }

  // just for testing
  @Post('seed')
  async seedPlans() {
    const created = [];
    for (const plan of PLANS) {
      // 1. Upsert plan in DB
      const dbPlan = await this.plansService.createPlan({
        ...plan,
        type: plan.type,
      });

      // 2. Create provider product
      const product = await this.paymentsService.createProduct({
        name: plan.name,
        description: plan.description,
        metadata: {
          planType: plan.type,
          workspaceLimit: plan.workspaceLimit,
          billingPeriod: plan.billingPeriod,
          features: plan.features,
          planName: plan.name,
        },
      });

      // 3. Create provider price
      const price = await this.paymentsService.createPrice({
        product: product.id,
        unitAmount: plan.priceCents,
        currency: 'usd',
        recurring: { interval: plan.billingPeriod },
      });

      // 4. Update plan with provider IDs if changed
      if (
        dbPlan.stripeProductId !== product.id ||
        dbPlan.stripePriceId !== price.id
      ) {
        await this.plansService.updatePlan(dbPlan.id, {
          name: plan.name,
          description: plan.description,
          priceCents: plan.priceCents,
          workspaceLimit: plan.workspaceLimit,
          features: plan.features,
          billingPeriod: plan.billingPeriod,
          stripeProductId: product.id,
          stripePriceId: price.id,
        });
      }

      created.push({
        ...dbPlan,
        stripeProductId: product.id,
        stripePriceId: price.id,
      });
    }
    return { message: 'Plans seeded (with provider)', plans: created };
  }
}
