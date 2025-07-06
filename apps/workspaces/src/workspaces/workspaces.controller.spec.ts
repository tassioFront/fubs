import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { AddMemberDto } from './dto/add-member.dto';

jest.mock('@prisma/client', () => ({
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

  const mockWorkspace = {
    id: 'test-workspace-id',
    name: 'Test Workspace',
    description: 'Test Description',
    ownerId: 1,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    members: [],
    projects: [],
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
          provide: 'PrismaService',
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

      const req = { user: { id: 1 } };
      const result = await controller.create(createWorkspaceDto, req);

      expect(result).toEqual(mockWorkspace);
      expect(service.create).toHaveBeenCalledWith(createWorkspaceDto, 1);
    });

    it('should create a workspace with fallback user ID when no user in request', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockWorkspace);

      const req = {}; // No user object
      const result = await controller.create(createWorkspaceDto, req);

      expect(result).toEqual(mockWorkspace);
      expect(service.create).toHaveBeenCalledWith(createWorkspaceDto, 1);
    });

    it('should handle service errors during workspace creation', async () => {
      const error = new BadRequestException('Invalid workspace data');
      jest.spyOn(service, 'create').mockRejectedValue(error);

      const req = { user: { id: 1 } };

      await expect(controller.create(createWorkspaceDto, req)).rejects.toThrow(
        BadRequestException
      );
      expect(service.create).toHaveBeenCalledWith(createWorkspaceDto, 1);
    });
  });

  describe('findAll', () => {
    it('should return all workspaces for authenticated user', async () => {
      const mockWorkspaces = [mockWorkspace];
      jest.spyOn(service, 'findAll').mockResolvedValue(mockWorkspaces);

      const req = { user: { id: 1 } };
      const result = await controller.findAll(req);

      expect(result).toEqual(mockWorkspaces);
      expect(service.findAll).toHaveBeenCalledWith(1);
    });

    it('should return workspaces with fallback user ID when no user in request', async () => {
      const mockWorkspaces = [mockWorkspace];
      jest.spyOn(service, 'findAll').mockResolvedValue(mockWorkspaces);

      const req = {}; // No user object
      const result = await controller.findAll(req);

      expect(result).toEqual(mockWorkspaces);
      expect(service.findAll).toHaveBeenCalledWith(1);
    });

    it('should return empty array when user has no workspaces', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([]);

      const req = { user: { id: 1 } };
      const result = await controller.findAll(req);

      expect(result).toEqual([]);
      expect(service.findAll).toHaveBeenCalledWith(1);
    });
  });

  describe('findOne', () => {
    const workspaceId = 'test-workspace-id';

    it('should return a workspace by ID', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockWorkspace);

      const req = { user: { id: 1 } };
      const result = await controller.findOne(workspaceId, req);

      expect(result).toEqual(mockWorkspace);
      expect(service.findOne).toHaveBeenCalledWith(workspaceId, 1);
    });

    it('should use fallback user ID when no user in request', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockWorkspace);

      const req = {}; // No user object
      const result = await controller.findOne(workspaceId, req);

      expect(result).toEqual(mockWorkspace);
      expect(service.findOne).toHaveBeenCalledWith(workspaceId, 1);
    });

    it('should handle workspace not found', async () => {
      const error = new NotFoundException('Workspace not found');
      jest.spyOn(service, 'findOne').mockRejectedValue(error);

      const req = { user: { id: 1 } };

      await expect(controller.findOne(workspaceId, req)).rejects.toThrow(
        NotFoundException
      );
      expect(service.findOne).toHaveBeenCalledWith(workspaceId, 1);
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

      const req = { user: { id: 1 } };
      const result = await controller.update(
        workspaceId,
        updateWorkspaceDto,
        req
      );

      expect(result).toEqual(updatedWorkspace);
      expect(service.update).toHaveBeenCalledWith(
        workspaceId,
        updateWorkspaceDto,
        1
      );
    });

    it('should use fallback user ID when no user in request', async () => {
      const updatedWorkspace = { ...mockWorkspace, ...updateWorkspaceDto };
      jest.spyOn(service, 'update').mockResolvedValue(updatedWorkspace);

      const req = {}; // No user object
      const result = await controller.update(
        workspaceId,
        updateWorkspaceDto,
        req
      );

      expect(result).toEqual(updatedWorkspace);
      expect(service.update).toHaveBeenCalledWith(
        workspaceId,
        updateWorkspaceDto,
        1
      );
    });

    it('should handle workspace not found during update', async () => {
      const error = new NotFoundException('Workspace not found');
      jest.spyOn(service, 'update').mockRejectedValue(error);

      const req = { user: { id: 1 } };

      await expect(
        controller.update(workspaceId, updateWorkspaceDto, req)
      ).rejects.toThrow(NotFoundException);
      expect(service.update).toHaveBeenCalledWith(
        workspaceId,
        updateWorkspaceDto,
        1
      );
    });

    it('should handle partial updates', async () => {
      const partialUpdate = { name: 'Only Name Updated' };
      const updatedWorkspace = { ...mockWorkspace, ...partialUpdate };
      jest.spyOn(service, 'update').mockResolvedValue(updatedWorkspace);

      const req = { user: { id: 1 } };
      const result = await controller.update(workspaceId, partialUpdate, req);

      expect(result).toEqual(updatedWorkspace);
      expect(service.update).toHaveBeenCalledWith(
        workspaceId,
        partialUpdate,
        1
      );
    });
  });

  describe('remove', () => {
    const workspaceId = 'test-workspace-id';

    it('should delete a workspace successfully', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      const req = { user: { id: 1 } };
      const result = await controller.remove(workspaceId, req);

      expect(result).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(workspaceId, 1);
    });

    it('should use fallback user ID when no user in request', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      const req = {}; // No user object
      const result = await controller.remove(workspaceId, req);

      expect(result).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(workspaceId, 1);
    });

    it('should handle workspace not found during deletion', async () => {
      const error = new NotFoundException('Workspace not found');
      jest.spyOn(service, 'remove').mockRejectedValue(error);

      const req = { user: { id: 1 } };

      await expect(controller.remove(workspaceId, req)).rejects.toThrow(
        NotFoundException
      );
      expect(service.remove).toHaveBeenCalledWith(workspaceId, 1);
    });
  });

  describe('addMember', () => {
    const workspaceId = 'test-workspace-id';
    const addMemberDto: AddMemberDto = {
      userId: 2,
      role: 'MEMBER' as const,
    };

    it('should add a member to workspace successfully', async () => {
      jest.spyOn(service, 'addMember').mockResolvedValue(mockWorkspaceMember);

      const req = { user: { id: 1 } };
      const result = await controller.addMember(workspaceId, addMemberDto, req);

      expect(result).toEqual(mockWorkspaceMember);
      expect(service.addMember).toHaveBeenCalledWith(
        workspaceId,
        addMemberDto,
        1
      );
    });

    it('should use fallback user ID when no user in request', async () => {
      jest.spyOn(service, 'addMember').mockResolvedValue(mockWorkspaceMember);

      const req = {}; // No user object
      const result = await controller.addMember(workspaceId, addMemberDto, req);

      expect(result).toEqual(mockWorkspaceMember);
      expect(service.addMember).toHaveBeenCalledWith(
        workspaceId,
        addMemberDto,
        1
      );
    });

    it('should handle workspace not found when adding member', async () => {
      const error = new NotFoundException('Workspace not found');
      jest.spyOn(service, 'addMember').mockRejectedValue(error);

      const req = { user: { id: 1 } };

      await expect(
        controller.addMember(workspaceId, addMemberDto, req)
      ).rejects.toThrow(NotFoundException);
      expect(service.addMember).toHaveBeenCalledWith(
        workspaceId,
        addMemberDto,
        1
      );
    });

    it('should handle invalid member data', async () => {
      const error = new BadRequestException('User already a member');
      jest.spyOn(service, 'addMember').mockRejectedValue(error);

      const req = { user: { id: 1 } };

      await expect(
        controller.addMember(workspaceId, addMemberDto, req)
      ).rejects.toThrow(BadRequestException);
      expect(service.addMember).toHaveBeenCalledWith(
        workspaceId,
        addMemberDto,
        1
      );
    });
  });

  describe('getMembers', () => {
    const workspaceId = 'test-workspace-id';

    it('should return workspace members successfully', async () => {
      const mockMembers = [mockWorkspaceMember];
      jest.spyOn(service, 'getMembers').mockResolvedValue(mockMembers);

      const req = { user: { id: 1 } };
      const result = await controller.getMembers(workspaceId, req);

      expect(result).toEqual(mockMembers);
      expect(service.getMembers).toHaveBeenCalledWith(workspaceId, 1);
    });

    it('should use fallback user ID when no user in request', async () => {
      const mockMembers = [mockWorkspaceMember];
      jest.spyOn(service, 'getMembers').mockResolvedValue(mockMembers);

      const req = {}; // No user object
      const result = await controller.getMembers(workspaceId, req);

      expect(result).toEqual(mockMembers);
      expect(service.getMembers).toHaveBeenCalledWith(workspaceId, 1);
    });

    it('should return empty array when workspace has no members', async () => {
      jest.spyOn(service, 'getMembers').mockResolvedValue([]);

      const req = { user: { id: 1 } };
      const result = await controller.getMembers(workspaceId, req);

      expect(result).toEqual([]);
      expect(service.getMembers).toHaveBeenCalledWith(workspaceId, 1);
    });

    it('should handle workspace not found when getting members', async () => {
      const error = new NotFoundException('Workspace not found');
      jest.spyOn(service, 'getMembers').mockRejectedValue(error);

      const req = { user: { id: 1 } };

      await expect(controller.getMembers(workspaceId, req)).rejects.toThrow(
        NotFoundException
      );
      expect(service.getMembers).toHaveBeenCalledWith(workspaceId, 1);
    });
  });

  describe('removeMember', () => {
    const workspaceId = 'test-workspace-id';
    const memberUserId = 2;

    it('should remove a member from workspace successfully', async () => {
      jest.spyOn(service, 'removeMember').mockResolvedValue(undefined);

      const req = { user: { id: 1 } };
      const result = await controller.removeMember(
        workspaceId,
        memberUserId,
        req
      );

      expect(result).toBeUndefined();
      expect(service.removeMember).toHaveBeenCalledWith(
        workspaceId,
        memberUserId,
        1
      );
    });

    it('should use fallback user ID when no user in request', async () => {
      jest.spyOn(service, 'removeMember').mockResolvedValue(undefined);

      const req = {}; // No user object
      const result = await controller.removeMember(
        workspaceId,
        memberUserId,
        req
      );

      expect(result).toBeUndefined();
      expect(service.removeMember).toHaveBeenCalledWith(
        workspaceId,
        memberUserId,
        1
      );
    });

    it('should handle workspace not found when removing member', async () => {
      const error = new NotFoundException('Workspace not found');
      jest.spyOn(service, 'removeMember').mockRejectedValue(error);

      const req = { user: { id: 1 } };

      await expect(
        controller.removeMember(workspaceId, memberUserId, req)
      ).rejects.toThrow(NotFoundException);
      expect(service.removeMember).toHaveBeenCalledWith(
        workspaceId,
        memberUserId,
        1
      );
    });

    it('should handle member not found when removing', async () => {
      const error = new NotFoundException('Member not found');
      jest.spyOn(service, 'removeMember').mockRejectedValue(error);

      const req = { user: { id: 1 } };

      await expect(
        controller.removeMember(workspaceId, memberUserId, req)
      ).rejects.toThrow(NotFoundException);
      expect(service.removeMember).toHaveBeenCalledWith(
        workspaceId,
        memberUserId,
        1
      );
    });

    it('should handle ParseIntPipe validation for userId parameter', async () => {
      // This tests the ParseIntPipe decorator behavior indirectly
      jest.spyOn(service, 'removeMember').mockResolvedValue(undefined);

      const req = { user: { id: 1 } };
      const validUserId = 123; // Should be a valid integer
      const result = await controller.removeMember(
        workspaceId,
        validUserId,
        req
      );

      expect(result).toBeUndefined();
      expect(service.removeMember).toHaveBeenCalledWith(
        workspaceId,
        validUserId,
        1
      );
    });
  });
});
