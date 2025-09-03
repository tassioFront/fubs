import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client-stitch';

@Injectable()
export class OrdersService {
  private readonly prisma = new PrismaClient();

  async getAllOrders() {
    return this.prisma.subscriptionEntitlement.findMany();
  }
}
