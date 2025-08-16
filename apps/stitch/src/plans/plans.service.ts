import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client-stitch';
import { CreatePlanDto, UpdatePlanDto, PlanOutputDto } from './plan.dto';
import { PlanType } from '@fubs/shared';

@Injectable()
export class PlansService {
  private readonly prisma = new PrismaClient();

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
}
