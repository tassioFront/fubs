import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { validationPipeConfig } from './common/validation.config';
import { AllExceptionsFilter } from '@fubs/shared';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();

  const globalPrefix = 'stitch';
  app.setGlobalPrefix(globalPrefix);

  app.useGlobalPipes(validationPipeConfig);
  app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('Stitch API')
    .setDescription('Checkout and payment integration API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(globalPrefix + '/api/docs', app, document);

  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(
    `📚 Swagger documentation: http://localhost:${port}/${globalPrefix}/api/docs`
  );
}

bootstrap();
