import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { validationPipeConfig } from './common/validation.config';
import { AllExceptionsFilter } from '@fubs/shared';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const globalPrefix = '';
  app.setGlobalPrefix(globalPrefix);

  app.useGlobalPipes(validationPipeConfig);

  app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('Sugarfoot API')
    .setDescription('Project management workspaces and projects API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
