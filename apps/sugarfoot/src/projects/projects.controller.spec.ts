import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from '../common/prisma.service';
import type { AuthenticatedRequest } from '@fubs/shared';
import { WorkspacesService } from '../workspaces/workspaces.service';

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
  project: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  workspace: {
    findFirst: jest.fn(),
  },
};

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let service: ProjectsService;

  // Test UUIDs
  const testUserId = 'b7f9a4e1-1234-5678-9abc-def012345678';
  const anotherUserId = 'c8f9a4e1-1234-5678-9abc-def012345679';
  const thirdUserId = 'd9f9a4e1-1234-5678-9abc-def012345680';
  const projectId = 'e1f9a4e1-1234-5678-9abc-def012345681';
  const workspaceId = 'f2f9a4e1-1234-5678-9abc-def012345682';

  // Helper function to create a properly formatted authenticated request
  const createAuthenticatedRequest = (
    userId = testUserId
  ): AuthenticatedRequest =>
    ({
      user: {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
      },
    } as AuthenticatedRequest);

  const mockProject = {
    id: projectId,
    name: 'Test Project',
    description: 'Test Description',
    status: 'ACTIVE' as const,
    workspaceId: workspaceId,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    workspace: {
      id: workspaceId,
      name: 'Test Workspace',
      ownerId: testUserId,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        {
          provide: ProjectsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: WorkspacesService,
          useValue: {
            findOneWithAccess: jest.fn(),
            isWorkspaceMember: jest.fn(),
            isWorkspaceOwner: jest.fn(),
            userHasAccess: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
    service = module.get<ProjectsService>(ProjectsService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  const createProjectDto: CreateProjectDto = {
    name: 'Test Project',
    description: 'Test Description',
  };

  const updateProjectDto: UpdateProjectDto = {
    name: 'Updated Project',
    description: 'Updated Description',
  };

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a project successfully with authenticated user', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockProject);

      const req = createAuthenticatedRequest();
      const result = await controller.create(
        workspaceId,
        createProjectDto,
        req
      );

      expect(result).toEqual(mockProject);
      expect(service.create).toHaveBeenCalledWith(
        workspaceId,
        createProjectDto,
        testUserId
      );
    });

    it('should handle workspace not found during project creation', async () => {
      const error = new NotFoundException(
        'Workspace not found or access denied'
      );
      jest.spyOn(service, 'create').mockRejectedValue(error);

      const req = createAuthenticatedRequest();
      await expect(
        controller.create(workspaceId, createProjectDto, req)
      ).rejects.toThrow(NotFoundException);

      expect(service.create).toHaveBeenCalledWith(
        workspaceId,
        createProjectDto,
        testUserId
      );
    });

    it('should handle service errors during project creation', async () => {
      const error = new BadRequestException('Invalid project data');
      jest.spyOn(service, 'create').mockRejectedValue(error);

      const req = createAuthenticatedRequest();
      await expect(
        controller.create(workspaceId, createProjectDto, req)
      ).rejects.toThrow(BadRequestException);
    });

    it('should create project with minimal data (only name)', async () => {
      const minimalDto: CreateProjectDto = { name: 'Minimal Project' };
      const minimalProject = { ...mockProject, name: 'Minimal Project' };
      jest.spyOn(service, 'create').mockResolvedValue(minimalProject);

      const req = createAuthenticatedRequest();
      const result = await controller.create(workspaceId, minimalDto, req);

      expect(result).toEqual(minimalProject);
      expect(service.create).toHaveBeenCalledWith(
        workspaceId,
        minimalDto,
        testUserId
      );
    });
  });

  describe('findAll', () => {
    it('should return all projects for workspace with authenticated user', async () => {
      const projects = [mockProject];
      jest.spyOn(service, 'findAll').mockResolvedValue(projects);

      const req = createAuthenticatedRequest();
      const result = await controller.findAll(workspaceId, req);

      expect(result).toEqual(projects);
      expect(service.findAll).toHaveBeenCalledWith(workspaceId, testUserId);
    });

    it('should handle workspace not found when finding projects', async () => {
      const error = new NotFoundException('Workspace not found');
      jest.spyOn(service, 'findAll').mockRejectedValue(error);

      const req = createAuthenticatedRequest();
      await expect(controller.findAll(workspaceId, req)).rejects.toThrow(
        NotFoundException
      );

      expect(service.findAll).toHaveBeenCalledWith(workspaceId, testUserId);
    });
  });

  describe('findOne', () => {
    it('should return a project by ID', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockProject);

      const req = createAuthenticatedRequest();
      const result = await controller.findOne(workspaceId, projectId, req);

      expect(result).toEqual(mockProject);
      expect(service.findOne).toHaveBeenCalledWith(projectId, testUserId);
    });

    it('should handle project not found', async () => {
      const error = new NotFoundException('Project not found');
      jest.spyOn(service, 'findOne').mockRejectedValue(error);

      const req = createAuthenticatedRequest();
      await expect(
        controller.findOne(workspaceId, projectId, req)
      ).rejects.toThrow(NotFoundException);

      expect(service.findOne).toHaveBeenCalledWith(projectId, testUserId);
    });
  });

  describe('update', () => {
    it('should update a project successfully', async () => {
      const updatedProject = { ...mockProject, ...updateProjectDto };
      jest.spyOn(service, 'update').mockResolvedValue(updatedProject);

      const req = createAuthenticatedRequest();
      const result = await controller.update(
        workspaceId,
        projectId,
        updateProjectDto,
        req
      );

      expect(result).toEqual(updatedProject);
      expect(service.update).toHaveBeenCalledWith(
        projectId,
        updateProjectDto,
        testUserId
      );
    });

    it('should handle project not found during update', async () => {
      const error = new NotFoundException('Project not found');
      jest.spyOn(service, 'update').mockRejectedValue(error);

      const req = createAuthenticatedRequest();
      await expect(
        controller.update(workspaceId, projectId, updateProjectDto, req)
      ).rejects.toThrow(NotFoundException);

      expect(service.update).toHaveBeenCalledWith(
        projectId,
        updateProjectDto,
        testUserId
      );
    });

    it('should handle partial updates', async () => {
      const partialUpdate: UpdateProjectDto = { name: 'New Name Only' };
      const updatedProject = { ...mockProject, name: 'New Name Only' };
      jest.spyOn(service, 'update').mockResolvedValue(updatedProject);

      const req = createAuthenticatedRequest();
      const result = await controller.update(
        workspaceId,
        projectId,
        partialUpdate,
        req
      );

      expect(result).toEqual(updatedProject);
      expect(service.update).toHaveBeenCalledWith(
        projectId,
        partialUpdate,
        testUserId
      );
    });

    it('should handle status updates', async () => {
      const statusUpdate: UpdateProjectDto = { status: 'COMPLETED' };
      const updatedProject = { ...mockProject, status: 'COMPLETED' as const };
      jest.spyOn(service, 'update').mockResolvedValue(updatedProject);

      const req = createAuthenticatedRequest();
      const result = await controller.update(
        workspaceId,
        projectId,
        statusUpdate,
        req
      );

      expect(result).toEqual(updatedProject);
      expect(service.update).toHaveBeenCalledWith(
        projectId,
        statusUpdate,
        testUserId
      );
    });

    it('should handle validation errors during update', async () => {
      const error = new BadRequestException('Invalid update data');
      jest.spyOn(service, 'update').mockRejectedValue(error);

      const req = createAuthenticatedRequest();
      await expect(
        controller.update(workspaceId, projectId, updateProjectDto, req)
      ).rejects.toThrow(BadRequestException);

      expect(service.update).toHaveBeenCalledWith(
        projectId,
        updateProjectDto,
        testUserId
      );
    });
  });

  describe('remove', () => {
    it('should delete a project successfully', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      const req = createAuthenticatedRequest();
      const result = await controller.remove(workspaceId, projectId, req);

      expect(result).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(projectId, testUserId);
    });

    it('should handle project not found during deletion', async () => {
      const error = new NotFoundException('Project not found');
      jest.spyOn(service, 'remove').mockRejectedValue(error);

      const req = createAuthenticatedRequest();
      await expect(
        controller.remove(workspaceId, projectId, req)
      ).rejects.toThrow(NotFoundException);

      expect(service.remove).toHaveBeenCalledWith(projectId, testUserId);
    });

    it('should handle insufficient permissions during deletion', async () => {
      const error = new BadRequestException('Insufficient permissions');
      jest.spyOn(service, 'remove').mockRejectedValue(error);

      const req = createAuthenticatedRequest(anotherUserId); // Different user
      await expect(
        controller.remove(workspaceId, projectId, req)
      ).rejects.toThrow(BadRequestException);

      expect(service.remove).toHaveBeenCalledWith(projectId, anotherUserId);
    });
  });

  describe('error handling', () => {
    it('should handle service throwing generic errors', async () => {
      const error = new Error('Generic service error');
      jest.spyOn(service, 'findAll').mockRejectedValue(error);

      const req = createAuthenticatedRequest();
      await expect(controller.findAll(workspaceId, req)).rejects.toThrow(
        'Generic service error'
      );
    });

    it('should handle undefined workspace ID', async () => {
      const req = createAuthenticatedRequest();
      await controller.create('' as string, createProjectDto, req);
      // The service should handle this validation internally
      expect(service.create).toHaveBeenCalledWith(
        '',
        createProjectDto,
        testUserId
      );
    });
  });

  describe('authentication edge cases', () => {
    it('should handle different user IDs correctly', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([]);

      const req = createAuthenticatedRequest(thirdUserId);
      await controller.findAll(workspaceId, req);

      expect(service.findAll).toHaveBeenCalledWith(workspaceId, thirdUserId);
    });
  });
});
