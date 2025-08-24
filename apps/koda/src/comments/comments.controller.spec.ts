import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from '../common/prisma.service';
import { WorkspaceMemberGuard } from '../auth/guards/workspace-member.guard';
import { WorkspaceMemberService } from '../auth/guards/workspace-member.service';

import type { UUID } from '@fubs/shared';

jest.mock('@prisma/client-koda', () => ({
  PrismaClient: jest.fn(),
}));

// Mock the shared library guards
jest.mock('@fubs/shared', () => ({
  ...jest.requireActual('@fubs/shared'),
  JwtAuthGuard: class MockJwtAuthGuard {
    canActivate() {
      return true;
    }
  },
}));

const mockPrismaService = {
  comment: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  task: {
    findUnique: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
};

describe('CommentsController', () => {
  let controller: CommentsController;
  let service: CommentsService;

  // Helper function to create a properly formatted authenticated request
  const createAuthenticatedRequest = (userId = 'user-123') => ({
    user: {
      id: userId,
      role: 'ADMIN',
    },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  const mockComment = {
    id: 'comment-123',
    content: 'This is a test comment',
    taskId: 'task-123',
    createdBy: 'user-123',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    task: {
      id: 'task-123',
      title: 'Test Task',
    },
    createdByUser: {
      id: 'user-123',
      email: 'user@example.com',
      name: 'Test User',
    },
  };

  const mockCommentByOtherUser = {
    ...mockComment,
    id: 'comment-456',
    createdBy: 'user-456',
    createdByUser: {
      id: 'user-456',
      email: 'other@example.com',
      name: 'Other User',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: {
            createComment: jest.fn(),
            getCommentsByTaskId: jest.fn(),
            getCommentById: jest.fn(),
            updateComment: jest.fn(),
            deleteComment: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: WorkspaceMemberGuard,
          useValue: {
            canActivate: jest.fn().mockReturnValue(true),
          },
        },
        {
          provide: WorkspaceMemberService,
          useValue: {
            getWorkspaceByTaskId: jest.fn(),
            userHasAccess: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
    service = module.get<CommentsService>(CommentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('createComment', () => {
    const createCommentDto: CreateCommentDto = {
      content: 'This is a test comment',
      taskId: 'task-123' as UUID,
      createdBy: 'user-123' as UUID,
    };

    it('should create a comment successfully', async () => {
      jest.spyOn(service, 'createComment').mockResolvedValue(mockComment);

      const result = await controller.createComment(createCommentDto);

      expect(result).toEqual(mockComment);
      expect(service.createComment).toHaveBeenCalledWith(createCommentDto);
    });

    it('should handle service errors during comment creation', async () => {
      const error = new NotFoundException('Task not found');
      jest.spyOn(service, 'createComment').mockRejectedValue(error);

      await expect(
        controller.createComment(createCommentDto)
      ).rejects.toThrow(NotFoundException);
      expect(service.createComment).toHaveBeenCalledWith(createCommentDto);
    });

    it('should create comment with empty content', async () => {
      const emptyCommentDto: CreateCommentDto = {
        content: '',
        taskId: 'task-123' as UUID,
        createdBy: 'user-123' as UUID,
      };
      const emptyComment = {
        ...mockComment,
        content: '',
      };
      jest.spyOn(service, 'createComment').mockResolvedValue(emptyComment);

      const result = await controller.createComment(emptyCommentDto);

      expect(result).toEqual(emptyComment);
      expect(service.createComment).toHaveBeenCalledWith(emptyCommentDto);
    });
  });

  describe('getCommentsByTaskId', () => {
    const taskId = 'task-123' as UUID;

    it('should return all comments for a task', async () => {
      const mockComments = [mockComment, mockCommentByOtherUser];
      jest.spyOn(service, 'getCommentsByTaskId').mockResolvedValue(mockComments);

      const result = await controller.getCommentsByTaskId(taskId);

      expect(result).toEqual(mockComments);
      expect(service.getCommentsByTaskId).toHaveBeenCalledWith(taskId);
    });

    it('should return empty array when task has no comments', async () => {
      jest.spyOn(service, 'getCommentsByTaskId').mockResolvedValue([]);

      const result = await controller.getCommentsByTaskId(taskId);

      expect(result).toEqual([]);
      expect(service.getCommentsByTaskId).toHaveBeenCalledWith(taskId);
    });

    it('should handle task not found', async () => {
      const error = new NotFoundException('Task not found');
      jest.spyOn(service, 'getCommentsByTaskId').mockRejectedValue(error);

      await expect(controller.getCommentsByTaskId(taskId)).rejects.toThrow(
        NotFoundException
      );
      expect(service.getCommentsByTaskId).toHaveBeenCalledWith(taskId);
    });
  });

  describe('updateComment', () => {
    const commentId = 'comment-123' as UUID;
    const updateCommentDto: UpdateCommentDto = {
      content: 'Updated comment content',
      commentId: 'comment-123',
    };

    it('should update a comment successfully when user is the owner', async () => {
      const updatedComment = {
        ...mockComment,
        content: 'Updated comment content',
        updatedAt: new Date('2023-01-02'),
      };
      jest.spyOn(service, 'getCommentById').mockResolvedValue(mockComment);
      jest.spyOn(service, 'updateComment').mockResolvedValue(updatedComment);

      const req = createAuthenticatedRequest('user-123');
      const result = await controller.updateComment(commentId, updateCommentDto, req);

      expect(result).toEqual(updatedComment);
      expect(service.getCommentById).toHaveBeenCalledWith(commentId);
      expect(service.updateComment).toHaveBeenCalledWith({
        ...updateCommentDto,
        commentId,
      });
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      jest.spyOn(service, 'getCommentById').mockResolvedValue(mockCommentByOtherUser);

      const req = createAuthenticatedRequest('user-123');

      await expect(
        controller.updateComment(commentId, updateCommentDto, req)
      ).rejects.toThrow(
        new ForbiddenException('You are not allowed to update this comment')
      );
      expect(service.getCommentById).toHaveBeenCalledWith(commentId);
      expect(service.updateComment).not.toHaveBeenCalled();
    });

    it('should handle comment not found during update', async () => {
      const error = new NotFoundException('Comment not found');
      jest.spyOn(service, 'getCommentById').mockRejectedValue(error);

      const req = createAuthenticatedRequest('user-123');

      await expect(
        controller.updateComment(commentId, updateCommentDto, req)
      ).rejects.toThrow(NotFoundException);
      expect(service.getCommentById).toHaveBeenCalledWith(commentId);
      expect(service.updateComment).not.toHaveBeenCalled();
    });

    it('should handle partial content update', async () => {
      const partialUpdate: UpdateCommentDto = {
        content: 'Partially updated',
        commentId: 'comment-123',
      };
      const partiallyUpdatedComment = {
        ...mockComment,
        content: 'Partially updated',
      };
      jest.spyOn(service, 'getCommentById').mockResolvedValue(mockComment);
      jest.spyOn(service, 'updateComment').mockResolvedValue(partiallyUpdatedComment);

      const req = createAuthenticatedRequest('user-123');
      const result = await controller.updateComment(commentId, partialUpdate, req);

      expect(result).toEqual(partiallyUpdatedComment);
      expect(service.updateComment).toHaveBeenCalledWith({
        ...partialUpdate,
        commentId,
      });
    });

    it('should allow owner with different user ID format', async () => {
      const commentWithDifferentUserId = {
        ...mockComment,
        createdBy: 'different-user-format-456',
      };
      const updatedComment = {
        ...commentWithDifferentUserId,
        content: 'Updated by different user format',
      };
      jest.spyOn(service, 'getCommentById').mockResolvedValue(commentWithDifferentUserId);
      jest.spyOn(service, 'updateComment').mockResolvedValue(updatedComment);

      const req = createAuthenticatedRequest('different-user-format-456');
      const result = await controller.updateComment(commentId, updateCommentDto, req);

      expect(result).toEqual(updatedComment);
      expect(service.getCommentById).toHaveBeenCalledWith(commentId);
      expect(service.updateComment).toHaveBeenCalledWith({
        ...updateCommentDto,
        commentId,
      });
    });
  });

  describe('deleteComment', () => {
    const commentId = 'comment-123' as UUID;

    it('should delete a comment successfully when user is the owner', async () => {
      const deleteResult = mockComment;
      jest.spyOn(service, 'getCommentById').mockResolvedValue(mockComment);
      jest.spyOn(service, 'deleteComment').mockResolvedValue(deleteResult);

      const req = createAuthenticatedRequest('user-123');
      const result = await controller.deleteComment(commentId, req);

      expect(result).toEqual(deleteResult);
      expect(service.getCommentById).toHaveBeenCalledWith(commentId);
      expect(service.deleteComment).toHaveBeenCalledWith(commentId);
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      jest.spyOn(service, 'getCommentById').mockResolvedValue(mockCommentByOtherUser);

      const req = createAuthenticatedRequest('user-123');

      await expect(
        controller.deleteComment(commentId, req)
      ).rejects.toThrow(
        new ForbiddenException('You are not allowed to delete this comment')
      );
      expect(service.getCommentById).toHaveBeenCalledWith(commentId);
      expect(service.deleteComment).not.toHaveBeenCalled();
    });

    it('should handle comment not found during deletion', async () => {
      const error = new NotFoundException('Comment not found');
      jest.spyOn(service, 'getCommentById').mockRejectedValue(error);

      const req = createAuthenticatedRequest('user-123');

      await expect(
        controller.deleteComment(commentId, req)
      ).rejects.toThrow(NotFoundException);
      expect(service.getCommentById).toHaveBeenCalledWith(commentId);
      expect(service.deleteComment).not.toHaveBeenCalled();
    });

    it('should delete comment when user is the owner with different ID format', async () => {
      const commentWithDifferentUserId = {
        ...mockComment,
        createdBy: 'uuid-format-789-abc',
      };
      const deleteResult = commentWithDifferentUserId;
      jest.spyOn(service, 'getCommentById').mockResolvedValue(commentWithDifferentUserId);
      jest.spyOn(service, 'deleteComment').mockResolvedValue(deleteResult);

      const req = createAuthenticatedRequest('uuid-format-789-abc');
      const result = await controller.deleteComment(commentId, req);

      expect(result).toEqual(deleteResult);
      expect(service.getCommentById).toHaveBeenCalledWith(commentId);
      expect(service.deleteComment).toHaveBeenCalledWith(commentId);
    });

    it('should handle service errors during deletion', async () => {
      const serviceError = new Error('Database connection failed');
      jest.spyOn(service, 'getCommentById').mockResolvedValue(mockComment);
      jest.spyOn(service, 'deleteComment').mockRejectedValue(serviceError);

      const req = createAuthenticatedRequest('user-123');

      await expect(
        controller.deleteComment(commentId, req)
      ).rejects.toThrow('Database connection failed');
      expect(service.getCommentById).toHaveBeenCalledWith(commentId);
      expect(service.deleteComment).toHaveBeenCalledWith(commentId);
    });
  });
});
