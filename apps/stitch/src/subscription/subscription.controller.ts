import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@fubs/shared';
import { SubscriptionService } from './subscription.service';
import {
  GetSubscriptionsQueryDto,
  SubscriptionResponseDto,
} from './dto/subscription.dto';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get()
  async getSubscriptions(
    @Query() query: GetSubscriptionsQueryDto
  ): Promise<SubscriptionResponseDto[]> {
    return this.subscriptionService.getSubscriptions(query);
  }

  @Get(':id')
  async getSubscriptionById(
    @Param('id') id: string
  ): Promise<SubscriptionResponseDto> {
    return this.subscriptionService.getSubscriptionById(id);
  }
}
