import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EventsService } from '../common/events.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private eventsService: EventsService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'sugarfoot-service',
    };
  }

  @Get('test-event')
  @ApiOperation({ summary: 'Test event publishing' })
  @ApiResponse({ status: 200, description: 'Event published successfully' })
  async testEvent() {
    const event = {
      id: 'test-project-1',
      name: 'Test Project',
      description: 'A test project for event publishing',
      status: 'ACTIVE',
      workspaceId: 'test-workspace-123',
      createdAt: new Date(),
      userId: 'test-user-456',
    };

    await this.eventsService.publishProjectCreated(event);

    return {
      status: 'success',
      message: 'Event published successfully',
      event,
    };
  }
}
