import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
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
  // Helper function to create a properly formatted authenticated request
  const createAuthenticatedRequest = (userId = 1) => ({
    user: {
      id: userId,
    },
  });

  const mockProject = {
    id: 'test-project-id',
    name: 'Test Project',
    description: 'Test Description',
    status: 'ACTIVE' as const,
    workspaceId: 'test-workspace-id',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    workspace: {
      id: 'test-workspace-id',
      name: 'Test Workspace',
      ownerId: 1,
    },
  };

  const workspaceId = 'test-workspace-id';

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
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
    service = module.get<ProjectsService>(ProjectsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createProjectDto: CreateProjectDto = {
      name: 'Test Project',
      description: 'Test Description',
      status: 'ACTIVE',
    };

    it('should create a project successfully with authenticated user', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockProject);

      const req = createAuthenticatedRequest(1);
      const result = await controller.create(
        workspaceId,
        createProjectDto,
        req
      );

      expect(result).toEqual(mockProject);
      expect(service.create).toHaveBeenCalledWith(
        workspaceId,
        createProjectDto,
        1
      );
    });

    it('should handle workspace not found during project creation', async () => {
      const error = new NotFoundException(
        'Workspace not found or access denied'
      );
      jest.spyOn(service, 'create').mockRejectedValue(error);

      const req = { user: { id: 1 } };

      await expect(
        controller.create(workspaceId, createProjectDto, req)
      ).rejects.toThrow(NotFoundException);
      expect(service.create).toHaveBeenCalledWith(
        workspaceId,
        createProjectDto,
        1
      );
    });
    it('should handle service errors during project creation', async () => {
      const error = new BadRequestException('Invalid project data');
      jest.spyOn(service, 'create').mockRejectedValue(error);

      const req = createAuthenticatedRequest(1);

      await expect(
        controller.create(workspaceId, createProjectDto, req)
      ).rejects.toThrow(BadRequestException);
      expect(service.create).toHaveBeenCalledWith(
        workspaceId,
        createProjectDto,
        1
      );
    });

    it('should create project with minimal data (only name)', async () => {
      const minimalDto: CreateProjectDto = {
        name: 'Minimal Project',
      };
      const minimalProject = {
        ...mockProject,
        name: 'Minimal Project',
        description: null,
      };

      jest.spyOn(service, 'create').mockResolvedValue(minimalProject);

      const req = createAuthenticatedRequest(1);
      const result = await controller.create(workspaceId, minimalDto, req);

      expect(result).toEqual(minimalProject);
      expect(service.create).toHaveBeenCalledWith(workspaceId, minimalDto, 1);
    });
  });

  describe('findAll', () => {
    it('should return all projects for workspace with authenticated user', async () => {
      const mockProjects = [mockProject];
      jest.spyOn(service, 'findAll').mockResolvedValue(mockProjects);

      const req = createAuthenticatedRequest(1);
      const result = await controller.findAll(workspaceId, req);

      expect(result).toEqual(mockProjects);
      expect(service.findAll).toHaveBeenCalledWith(workspaceId, 1);
    });
    it('should handle workspace not found when finding projects', async () => {
      const error = new NotFoundException(
        'Workspace not found or access denied'
      );
      jest.spyOn(service, 'findAll').mockRejectedValue(error);

      const req = createAuthenticatedRequest(1);

      await expect(controller.findAll(workspaceId, req)).rejects.toThrow(
        NotFoundException
      );
      expect(service.findAll).toHaveBeenCalledWith(workspaceId, 1);
    });
  });

  describe('findOne', () => {
    const projectId = 'test-project-id';

    it('should return a project by ID', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockProject);

      const req = createAuthenticatedRequest(1);
      const result = await controller.findOne(projectId, req);

      expect(result).toEqual(mockProject);
      expect(service.findOne).toHaveBeenCalledWith(projectId, 1);
    });
  });

  describe('update', () => {
    const projectId = 'test-project-id';
    const updateProjectDto: UpdateProjectDto = {
      name: 'Updated Project',
      description: 'Updated Description',
      status: 'COMPLETED',
    };

    it('should update a project successfully', async () => {
      const updatedProject = { ...mockProject, ...updateProjectDto };
      jest.spyOn(service, 'update').mockResolvedValue(updatedProject);

      const req = createAuthenticatedRequest(1);
      const result = await controller.update(projectId, updateProjectDto, req);

      expect(result).toEqual(updatedProject);
      expect(service.update).toHaveBeenCalledWith(
        projectId,
        updateProjectDto,
        1
      );
    });
    it('should handle project not found during update', async () => {
      const error = new NotFoundException('Project not found or access denied');
      jest.spyOn(service, 'update').mockRejectedValue(error);

      const req = createAuthenticatedRequest(1);

      await expect(
        controller.update(projectId, updateProjectDto, req)
      ).rejects.toThrow(NotFoundException);
      expect(service.update).toHaveBeenCalledWith(
        projectId,
        updateProjectDto,
        1
      );
    });

    it('should handle partial updates', async () => {
      const partialUpdate: UpdateProjectDto = { name: 'Only Name Updated' };
      const updatedProject = { ...mockProject, name: 'Only Name Updated' };
      jest.spyOn(service, 'update').mockResolvedValue(updatedProject);

      const req = createAuthenticatedRequest(1);
      const result = await controller.update(projectId, partialUpdate, req);

      expect(result).toEqual(updatedProject);
      expect(service.update).toHaveBeenCalledWith(projectId, partialUpdate, 1);
    });

    it('should handle status updates', async () => {
      const statusUpdate: UpdateProjectDto = { status: 'ARCHIVED' };
      const updatedProject = { ...mockProject, status: 'ARCHIVED' as const };
      jest.spyOn(service, 'update').mockResolvedValue(updatedProject);

      const req = createAuthenticatedRequest(1);
      const result = await controller.update(projectId, statusUpdate, req);

      expect(result).toEqual(updatedProject);
      expect(service.update).toHaveBeenCalledWith(projectId, statusUpdate, 1);
    });

    it('should handle validation errors during update', async () => {
      const error = new BadRequestException('Invalid project data');
      jest.spyOn(service, 'update').mockRejectedValue(error);

      const req = createAuthenticatedRequest(1);

      await expect(
        controller.update(projectId, updateProjectDto, req)
      ).rejects.toThrow(BadRequestException);
      expect(service.update).toHaveBeenCalledWith(
        projectId,
        updateProjectDto,
        1
      );
    });
  });

  describe('remove', () => {
    const projectId = 'test-project-id';

    it('should delete a project successfully', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      const req = createAuthenticatedRequest(1);
      const result = await controller.remove(projectId, req);

      expect(result).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(projectId, 1);
    });

    it('should handle project not found during deletion', async () => {
      const error = new NotFoundException('Project not found or access denied');
      jest.spyOn(service, 'remove').mockRejectedValue(error);

      const req = { user: { id: 1 } };

      await expect(controller.remove(projectId, req)).rejects.toThrow(
        NotFoundException
      );
      expect(service.remove).toHaveBeenCalledWith(projectId, 1);
    });
    it('should handle insufficient permissions during deletion', async () => {
      const error = new NotFoundException('Project not found or access denied');
      jest.spyOn(service, 'remove').mockRejectedValue(error);

      const req = createAuthenticatedRequest(999); // Different user

      await expect(controller.remove(projectId, req)).rejects.toThrow(
        NotFoundException
      );
      expect(service.remove).toHaveBeenCalledWith(projectId, 999);
    });
  });

  describe('error handling', () => {
    it('should handle service throwing generic errors', async () => {
      const error = new Error('Database connection failed');
      jest.spyOn(service, 'findAll').mockRejectedValue(error);

      const req = createAuthenticatedRequest(1);

      await expect(controller.findAll(workspaceId, req)).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should handle undefined workspace ID', async () => {
      const createProjectDto: CreateProjectDto = {
        name: 'Test Project',
      };

      jest.spyOn(service, 'create').mockResolvedValue(mockProject);

      const req = createAuthenticatedRequest(1);
      await controller.create('' as string, createProjectDto, req);

      expect(service.create).toHaveBeenCalledWith('', createProjectDto, 1);
    });
  });

  describe('authentication edge cases', () => {
    it('should handle request with user ID as number', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([]);

      const req = createAuthenticatedRequest(123); // ID as number
      await controller.findAll(workspaceId, req);

      expect(service.findAll).toHaveBeenCalledWith(workspaceId, 123);
    });

    it('should handle different user IDs correctly', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([]);

      const req = createAuthenticatedRequest(456);
      await controller.findAll(workspaceId, req);

      expect(service.findAll).toHaveBeenCalledWith(workspaceId, 456);
    });
  });
});
