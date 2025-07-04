import { Test, TestingModule } from '@nestjs/testing';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesService } from './workspaces.service';
import { PrismaService } from '../common/prisma.service';

describe('WorkspacesController', () => {
  let controller: WorkspacesController;
  let service: WorkspacesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspacesController],
      providers: [
        WorkspacesService,
        {
          provide: PrismaService,
          useValue: {
            workspace: {
              create: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            workspaceMember: {
              create: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    controller = module.get<WorkspacesController>(WorkspacesController);
    service = module.get<WorkspacesService>(WorkspacesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a workspace', async () => {
      const createWorkspaceDto = {
        name: 'Test Workspace',
        description: 'Test Description',
      };

      const mockWorkspace = {
        id: 'test-id',
        name: 'Test Workspace',
        description: 'Test Description',
        ownerId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        members: [],
        projects: [],
      };

      jest.spyOn(service, 'create').mockResolvedValue(mockWorkspace);

      const req = { user: { id: 1 } };
      const result = await controller.create(createWorkspaceDto, req);

      expect(result).toEqual(mockWorkspace);
      expect(service.create).toHaveBeenCalledWith(createWorkspaceDto, 1);
    });
  });
});
