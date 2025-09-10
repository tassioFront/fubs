import { Module } from '@nestjs/common';
import { OutboxProcessorService } from './outbox-processor.service';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma.service';
import { EventsService } from '../events/events.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Names } from '@fubs/shared';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ClientsModule.register([
      {
        name: Names.sugarfoot,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL as string],
          queue: process.env.RABBITMQ_QUEUE as string,
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  providers: [OutboxProcessorService, PrismaService, EventsService],
})
export class OutboxProcessorModule {}
