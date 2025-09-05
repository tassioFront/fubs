import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { getInternalApiToken } from '@fubs/shared';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Get('token')
  getInternalApiToken() {
    // it shouldn't exist. It is for testing purposes only once this application isnt real
    const token = getInternalApiToken({
      serviceName: process.env.STITCH_SERVICE_NAME as string,
    });
    return token;
  }
}
