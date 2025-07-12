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
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: process.env.RABBITMQ_QUEUE || 'sugarfoot-events',
          queueOptions: { durable: false },
        },
      },
    ]),
  ],
  providers: [EventsService],
  exports: [EventsService, ClientsModule],
})
export class EventsModule {}
