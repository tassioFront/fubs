import { ValidationPipe } from '@nestjs/common';

export const validationPipeConfig = new ValidationPipe({
  whitelist: true, // Only allow properties that are defined in the DTO
  forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are present
  transform: true, // Automatically transform payloads to DTO instances
  disableErrorMessages: false, // Enable error messages for validation errors
});
