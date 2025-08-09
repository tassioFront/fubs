import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '../app.controller';
import { EventsService } from '../../events/events.service';

describe('AppController', () => {
  let app: TestingModule;
  let appController: AppController;
  let eventsService: EventsService;

  const mockEventsService = {
    publishProjectCreated: jest.fn(),
  };

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    eventsService = app.get<EventsService>(EventsService);
  });

  describe('healthCheck', () => {
    it('should return health check response with status ok', () => {
      const result = appController.healthCheck();

      expect(result).toEqual(
        expect.objectContaining({
          status: 'ok',
          service: 'sugarfoot-service',
          timestamp: expect.any(String),
        })
      );
    });
  });

  describe('testEvent', () => {
    it('should publish project created event successfully', async () => {
      mockEventsService.publishProjectCreated.mockResolvedValue(undefined);

      const result = await appController.testEvent();

      expect(result).toEqual(
        expect.objectContaining({
          status: 'success',
          message: 'Event published successfully',
          event: expect.objectContaining({
            id: expect.any(String),
            workspaceId: 'test-workspace-456',
          }),
        })
      );

      expect(eventsService.publishProjectCreated).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
          workspaceId: 'test-workspace-456',
        })
      );
    });
  });
});
