import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EventsService } from './events.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'RABBITMQ_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL as string],
          queue: process.env.RABBITMQ_QUEUE as string,
          queueOptions: { durable: false },
        },
      },
    ]),
  ],
  providers: [EventsService],
  exports: [EventsService, ClientsModule],
})
export class EventsModule {}
