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
          urls: ['amqp://guest:guest@localhost:5672'],
          queue: 'sugarfoot-events',
          queueOptions: { durable: false },
        },
      },
    ]),
  ],
  providers: [EventsService],
  exports: [EventsService, ClientsModule],
})
export class EventsModule {}
