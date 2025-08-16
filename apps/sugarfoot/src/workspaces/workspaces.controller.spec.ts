import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { PrismaService } from '../common/prisma.service';

jest.mock('@prisma/client-sugarfoot', () => ({
  PrismaClient: jest.fn(),
  WorkspaceMemberRole: {
    ADMIN: 'ADMIN',
    MEMBER: 'MEMBER',
  },
  ProjectStatus: {
    ACTIVE: 'ACTIVE',
    COMPLETED: 'COMPLETED',
    ARCHIVED: 'ARCHIVED',
  },
}));

const mockPrismaService = {
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
};

describe('WorkspacesController', () => {
  let controller: WorkspacesController;
  let service: WorkspacesService;

  // Helper function to create a properly formatted authenticated request
  const createAuthenticatedRequest = (userId = 1) => ({
    user: {
      id: userId,
    },
  });

  const mockWorkspace = {
    id: 'test-workspace-id',
    name: 'Test Workspace',
    description: 'Test Description',
    ownerId: '1',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    members: [],
    projects: [],
  };

  const mockWorkspaceResponseDto = {
    id: 'test-workspace-id',
    name: 'Test Workspace',
    description: 'Test Description',
    ownerId: '1',
    memberIds: [],
  };

  const mockWorkspaceMember = {
    id: 'test-member-id',
    workspaceId: 'test-workspace-id',
    userId: 2,
    role: 'MEMBER' as const,
    joinedAt: new Date('2023-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspacesController],
      providers: [
        {
          provide: WorkspacesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            addMember: jest.fn(),
            getMembers: jest.fn(),
            removeMember: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<WorkspacesController>(WorkspacesController);
    service = module.get<WorkspacesService>(WorkspacesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createWorkspaceDto: CreateWorkspaceDto = {
      name: 'Test Workspace',
      description: 'Test Description',
    };

    it('should create a workspace successfully with authenticated user', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockWorkspace);

      const req = createAuthenticatedRequest();
      const result = await controller.create(createWorkspaceDto, req);

      expect(result).toEqual(mockWorkspaceResponseDto);
      expect(service.create).toHaveBeenCalledWith(createWorkspaceDto, {
        id: 1,
      });
    });

    it('should handle service errors during workspace creation', async () => {
      const error = new BadRequestException('Invalid workspace data');
      jest.spyOn(service, 'create').mockRejectedValue(error);

      const req = createAuthenticatedRequest();

      await expect(controller.create(createWorkspaceDto, req)).rejects.toThrow(
        BadRequestException
      );
      expect(service.create).toHaveBeenCalledWith(createWorkspaceDto, {
        id: 1,
      });
    });
  });

  describe('findAll', () => {
    it('should return all workspaces for authenticated user', async () => {
      const mockWorkspaces = [mockWorkspace];
      jest.spyOn(service, 'findAll').mockResolvedValue(mockWorkspaces);

      const req = createAuthenticatedRequest(1);
      const result = await controller.findAll(req);

      expect(result).toEqual([mockWorkspaceResponseDto]);
      expect(service.findAll).toHaveBeenCalledWith(1);
    });

    it('should return empty array when user has no workspaces', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([]);

      const req = createAuthenticatedRequest(1);
      const result = await controller.findAll(req);

      expect(result).toEqual([]);
      expect(service.findAll).toHaveBeenCalledWith(1);
    });
  });

  describe('findOne', () => {
    const workspaceId = 'test-workspace-id';

    it('should return a workspace by ID', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockWorkspace);

      const req = createAuthenticatedRequest(1);
      const result = await controller.findOne(workspaceId, req);

      expect(result).toEqual(mockWorkspaceResponseDto);
      expect(service.findOne).toHaveBeenCalledWith(workspaceId);
    });

    it('should handle workspace not found', async () => {
      const error = new NotFoundException('Workspace not found');
      jest.spyOn(service, 'findOne').mockRejectedValue(error);

      const req = createAuthenticatedRequest(1);

      await expect(controller.findOne(workspaceId, req)).rejects.toThrow(
        NotFoundException
      );
      expect(service.findOne).toHaveBeenCalledWith(workspaceId);
    });
  });

  describe('update', () => {
    const workspaceId = 'test-workspace-id';
    const updateWorkspaceDto: UpdateWorkspaceDto = {
      name: 'Updated Workspace',
      description: 'Updated Description',
    };

    it('should update a workspace successfully', async () => {
      const updatedWorkspace = { ...mockWorkspace, ...updateWorkspaceDto };
      jest.spyOn(service, 'update').mockResolvedValue(updatedWorkspace);

      const req = createAuthenticatedRequest(1);
      const result = await controller.update(
        workspaceId,
        updateWorkspaceDto,
        req
      );

      expect(result).toEqual(updatedWorkspace);
      expect(service.update).toHaveBeenCalledWith(
        workspaceId,
        updateWorkspaceDto
      );
    });

    it('should handle workspace not found during update', async () => {
      const error = new NotFoundException('Workspace not found');
      jest.spyOn(service, 'update').mockRejectedValue(error);

      const req = createAuthenticatedRequest(1);

      await expect(
        controller.update(workspaceId, updateWorkspaceDto, req)
      ).rejects.toThrow(NotFoundException);
      expect(service.update).toHaveBeenCalledWith(
        workspaceId,
        updateWorkspaceDto
      );
    });

    it('should handle partial updates', async () => {
      const partialUpdate = { name: 'Only Name Updated' };
      const updatedWorkspace = { ...mockWorkspace, ...partialUpdate };
      jest.spyOn(service, 'update').mockResolvedValue(updatedWorkspace);

      const req = createAuthenticatedRequest(1);
      const result = await controller.update(workspaceId, partialUpdate, req);

      expect(result).toEqual(updatedWorkspace);
      expect(service.update).toHaveBeenCalledWith(workspaceId, partialUpdate);
    });
  });

  describe('remove', () => {
    const workspaceId = 'test-workspace-id';

    it('should delete a workspace successfully', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      const req = createAuthenticatedRequest(1);
      const result = await controller.remove(workspaceId, req);

      expect(result).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(workspaceId);
    });

    it('should handle workspace not found during deletion', async () => {
      const error = new NotFoundException('Workspace not found');
      jest.spyOn(service, 'remove').mockRejectedValue(error);

      const req = createAuthenticatedRequest(1);

      await expect(controller.remove(workspaceId, req)).rejects.toThrow(
        NotFoundException
      );
      expect(service.remove).toHaveBeenCalledWith(workspaceId);
    });
  });
});
