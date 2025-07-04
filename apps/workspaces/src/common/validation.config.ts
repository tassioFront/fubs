import { ValidationPipe } from '@nestjs/common';

export const validationPipeConfig = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  disableErrorMessages: false,
});
