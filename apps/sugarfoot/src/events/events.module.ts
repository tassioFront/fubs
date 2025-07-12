import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EventsService } from './events.service';
import { Names } from '@fubs/shared';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: Names.sugarfoot,
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
