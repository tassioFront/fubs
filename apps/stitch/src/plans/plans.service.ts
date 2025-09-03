import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client-stitch';
import {
  CreatePlanDto,
  UpdatePlanDto,
  PlanOutputDto,
  CreateCheckoutSessionDto,
} from './plan.dto';
import { Plan, PlanType, CheckoutSession } from '@fubs/shared';
import { PaymentsService } from '../payment/payments.service';
import { CustomerService } from '../customer/customer.service';

@Injectable()
export class PlansService {
  private readonly prisma = new PrismaClient();
  private readonly logger = new Logger(PlansService.name);

  constructor(
    private readonly payments: PaymentsService,
    private readonly customer: CustomerService
  ) {}

  async getAllPlans(): Promise<PlanOutputDto[]> {
    const plans = await this.prisma.plan.findMany();
    return plans.map(
      (plan) =>
        new PlanOutputDto({
          ...plan,
          type: plan.type as PlanType,
        })
    );
  }

  async getPlanById(id: string): Promise<PlanOutputDto> {
    const plan = await this.prisma.plan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');
    this.logger.log(`Plan found: ${plan.id}`);
    return new PlanOutputDto({
      ...plan,
      type: plan.type as PlanType,
    });
  }

  async getPlanByType(type: PlanType): Promise<PlanOutputDto | null> {
    const planType = type;
    const plan = await this.prisma.plan.findFirst({
      where: { type: planType },
    });
    return plan
      ? new PlanOutputDto({
          ...plan,
          type: plan.type as PlanType,
        })
      : null;
  }

  async createPlan(dto: CreatePlanDto): Promise<PlanOutputDto> {
    const data = {
      ...dto,
    };
    const plan = await this.prisma.plan.create({ data });
    return new PlanOutputDto({
      ...plan,
      type: plan.type as PlanType,
    });
  }

  async updatePlan(
    id: string,
    dto: UpdatePlanDto
  ): Promise<{ message: string }> {
    await this.prisma.plan.update({ where: { id }, data: dto });
    return { message: 'Plan updated successfully' };
  }

  async deletePlan(id: string): Promise<{ message: string }> {
    await this.prisma.plan.delete({ where: { id } });
    return { message: 'Plan deleted successfully' };
  }

  async createCheckoutSession(
    dto: CreateCheckoutSessionDto
  ): Promise<CheckoutSession> {
    const plan = await this.getPlanById(dto.planId);
    const customer = await this.customer.getCustomerByOwnerId(dto.ownerId);

    return await this.payments.createCheckoutSession({
      customer,
      plan: plan as Plan,
      successUrl: dto.successUrl,
      cancelUrl: dto.cancelUrl,
      ownerId: dto.ownerId,
    });
  }
}
