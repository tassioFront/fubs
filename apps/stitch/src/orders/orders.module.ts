import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersRepository } from './orders.repository';

@Module({
  providers: [OrdersService, OrdersRepository],
  exports: [OrdersService, OrdersRepository],
})
export class OrdersModule {}
