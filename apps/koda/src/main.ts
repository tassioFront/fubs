/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL as string],
      queue: process.env.RABBITMQ_QUEUE as string,
      queueOptions: {
        durable: false,
      },
      socketOptions: {
        heartbeatIntervalInSeconds: 60,
        reconnectTimeInSeconds: 5,
      },
    },
  });

  const port = process.env.PORT || 4000;

  await app.startAllMicroservices();

  await app.listen(port);

  Logger.log(
    `🚀 Application is running on: http://localhost:${port}}`
  );
}

bootstrap();
