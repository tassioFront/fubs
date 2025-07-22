import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { CreateTaskDto, TaskStatus, TaskPriority } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from '../common/prisma.service';

jest.mock('@prisma/client-tasks', () => ({
  PrismaClient: jest.fn(),
  TaskStatus: {
    TODO: 'TODO',
    IN_PROGRESS: 'IN_PROGRESS',
    DONE: 'DONE',
  },
  TaskPriority: {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
  },
}));

const mockPrismaService = {
  task: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  project: {
    findFirst: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
};

describe('TasksController', () => {
  let controller: TasksController;
  let service: TasksService;

  // Helper function to create a properly formatted authenticated request
  const createAuthenticatedRequest = (userId = 'user-123') => ({
    user: {
      id: userId,
    },
  });

  const mockTask = {
    id: 'test-task-id',
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    projectId: 'test-project-id',
    createdBy: 'user-123',
    assignedTo: null,
    dueDate: new Date('2023-12-01T00:00:00Z'),
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    project: {
      id: 'test-project-id',
    },
    createdByUser: {
      id: 'user-123',
    },
    assignedUser: null,
  };

  const mockAssignedTask = {
    ...mockTask,
    assignedTo: 'user-456',
    assignedUser: {
      id: 'user-456',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: {
            create: jest.fn(),
            findAllByProjectId: jest.fn(),
            assignTaskToUser: jest.fn(),
            unassignTask: jest.fn(),
            deleteTask: jest.fn(),
            updateTask: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    service = module.get<TasksService>(TasksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const projectId = 'test-project-id';
    const createTaskDto: CreateTaskDto = {
      title: 'Test Task',
      description: 'Test Description',
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.TODO,
      dueDate: '2023-12-01T00:00:00Z',
    };

    it('should create a task successfully with authenticated user', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockTask);

      const req = createAuthenticatedRequest();
      const result = await controller.create(projectId, createTaskDto, req);

      expect(result).toEqual(mockTask);
      expect(service.create).toHaveBeenCalledWith(
        projectId,
        createTaskDto,
        'user-123'
      );
    });

    it('should handle service errors during task creation', async () => {
      const error = new NotFoundException(
        'Project not found or user not authorized'
      );
      jest.spyOn(service, 'create').mockRejectedValue(error);

      const req = createAuthenticatedRequest();

      await expect(
        controller.create(projectId, createTaskDto, req)
      ).rejects.toThrow(NotFoundException);
      expect(service.create).toHaveBeenCalledWith(
        projectId,
        createTaskDto,
        'user-123'
      );
    });

    it('should create task with minimal required fields', async () => {
      const minimalTaskDto: CreateTaskDto = {
        title: 'Minimal Task',
        priority: TaskPriority.LOW,
      };
      const minimalTask = {
        ...mockTask,
        title: minimalTaskDto.title,
        priority: minimalTaskDto.priority,
      };
      jest.spyOn(service, 'create').mockResolvedValue(minimalTask);

      const req = createAuthenticatedRequest();
      const result = await controller.create(projectId, minimalTaskDto, req);

      expect(result).toEqual(minimalTask);
      expect(service.create).toHaveBeenCalledWith(
        projectId,
        minimalTaskDto,
        'user-123'
      );
    });
  });

  describe('findAllByProjectId', () => {
    const projectId = 'test-project-id';

    it('should return all tasks for a project', async () => {
      const mockTasks = [mockTask, mockAssignedTask];
      jest.spyOn(service, 'findAllByProjectId').mockResolvedValue(mockTasks);

      const result = await controller.findAllByProjectId(projectId);

      expect(result).toEqual(mockTasks);
      expect(service.findAllByProjectId).toHaveBeenCalledWith(projectId);
    });

    it('should return empty array when project has no tasks', async () => {
      jest.spyOn(service, 'findAllByProjectId').mockResolvedValue([]);

      const result = await controller.findAllByProjectId(projectId);

      expect(result).toEqual([]);
      expect(service.findAllByProjectId).toHaveBeenCalledWith(projectId);
    });

    it('should handle project not found', async () => {
      const error = new NotFoundException('Project not found');
      jest.spyOn(service, 'findAllByProjectId').mockRejectedValue(error);

      await expect(controller.findAllByProjectId(projectId)).rejects.toThrow(
        NotFoundException
      );
      expect(service.findAllByProjectId).toHaveBeenCalledWith(projectId);
    });
  });

  describe('assignTask', () => {
    const taskId = 'test-task-id';
    const assignedUserId = 'user-456';

    it('should assign a task to a user successfully', async () => {
      jest
        .spyOn(service, 'assignTaskToUser')
        .mockResolvedValue(mockAssignedTask);

      const result = await controller.assignTask(taskId, assignedUserId);

      expect(result).toEqual(mockAssignedTask);
      expect(service.assignTaskToUser).toHaveBeenCalledWith(
        taskId,
        assignedUserId
      );
    });

    it('should handle task not found when assigning', async () => {
      const error = new NotFoundException('Task not found');
      jest.spyOn(service, 'assignTaskToUser').mockRejectedValue(error);

      await expect(
        controller.assignTask(taskId, assignedUserId)
      ).rejects.toThrow(NotFoundException);
      expect(service.assignTaskToUser).toHaveBeenCalledWith(
        taskId,
        assignedUserId
      );
    });

    it('should handle user not found when assigning', async () => {
      const error = new NotFoundException('User not found');
      jest.spyOn(service, 'assignTaskToUser').mockRejectedValue(error);

      await expect(
        controller.assignTask(taskId, assignedUserId)
      ).rejects.toThrow(NotFoundException);
      expect(service.assignTaskToUser).toHaveBeenCalledWith(
        taskId,
        assignedUserId
      );
    });
  });

  describe('unassignTask', () => {
    const taskId = 'test-task-id';
    const assignedUserId = 'user-456';

    it('should unassign a task from a user successfully', async () => {
      const unassignedTask = {
        ...mockAssignedTask,
        assignedTo: null,
        assignedUser: null,
      };
      jest.spyOn(service, 'unassignTask').mockResolvedValue(unassignedTask);

      const result = await controller.unassignTask(taskId, assignedUserId);

      expect(result).toEqual(unassignedTask);
      expect(service.unassignTask).toHaveBeenCalledWith(taskId, assignedUserId);
    });

    it('should handle task not found when unassigning', async () => {
      const error = new NotFoundException('Task not found');
      jest.spyOn(service, 'unassignTask').mockRejectedValue(error);

      await expect(
        controller.unassignTask(taskId, assignedUserId)
      ).rejects.toThrow(NotFoundException);
      expect(service.unassignTask).toHaveBeenCalledWith(taskId, assignedUserId);
    });

    it('should handle user not assigned to task when unassigning', async () => {
      const error = new NotFoundException('User not assigned to this task');
      jest.spyOn(service, 'unassignTask').mockRejectedValue(error);

      await expect(
        controller.unassignTask(taskId, assignedUserId)
      ).rejects.toThrow(NotFoundException);
      expect(service.unassignTask).toHaveBeenCalledWith(taskId, assignedUserId);
    });
  });

  describe('deleteTask', () => {
    const taskId = 'test-task-id';

    it('should delete a task successfully', async () => {
      const deleteResult = { message: 'Task deleted successfully' };
      jest.spyOn(service, 'deleteTask').mockResolvedValue(deleteResult);

      const result = await controller.deleteTask(taskId);

      expect(result).toEqual(deleteResult);
      expect(service.deleteTask).toHaveBeenCalledWith(taskId);
    });

    it('should handle task not found during deletion', async () => {
      const error = new NotFoundException('Task not found');
      jest.spyOn(service, 'deleteTask').mockRejectedValue(error);

      await expect(controller.deleteTask(taskId)).rejects.toThrow(
        NotFoundException
      );
      expect(service.deleteTask).toHaveBeenCalledWith(taskId);
    });
  });

  describe('updateTask', () => {
    const taskId = 'test-task-id';
    const updateTaskDto: UpdateTaskDto = {
      title: 'Updated Task',
      description: 'Updated Description',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
    };

    it('should update a task successfully', async () => {
      const updatedTask = {
        ...mockTask,
        title: 'Updated Task',
        description: 'Updated Description',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
      };
      jest.spyOn(service, 'updateTask').mockResolvedValue(updatedTask);

      const result = await controller.updateTask(taskId, updateTaskDto);

      expect(result).toEqual(updatedTask);
      expect(service.updateTask).toHaveBeenCalledWith(taskId, updateTaskDto);
    });

    it('should handle task not found during update', async () => {
      const error = new NotFoundException('Task not found');
      jest.spyOn(service, 'updateTask').mockRejectedValue(error);

      await expect(
        controller.updateTask(taskId, updateTaskDto)
      ).rejects.toThrow(NotFoundException);
      expect(service.updateTask).toHaveBeenCalledWith(taskId, updateTaskDto);
    });

    it('should handle partial updates', async () => {
      const partialUpdate: UpdateTaskDto = { title: 'Only Title Updated' };
      const partiallyUpdatedTask = { ...mockTask, title: 'Only Title Updated' };
      jest.spyOn(service, 'updateTask').mockResolvedValue(partiallyUpdatedTask);

      const result = await controller.updateTask(taskId, partialUpdate);

      expect(result).toEqual(partiallyUpdatedTask);
      expect(service.updateTask).toHaveBeenCalledWith(taskId, partialUpdate);
    });

    it('should handle status update only', async () => {
      const statusUpdate: UpdateTaskDto = { status: TaskStatus.DONE };
      const statusUpdatedTask = { ...mockTask, status: TaskStatus.DONE };
      jest.spyOn(service, 'updateTask').mockResolvedValue(statusUpdatedTask);

      const result = await controller.updateTask(taskId, statusUpdate);

      expect(result).toEqual(statusUpdatedTask);
      expect(service.updateTask).toHaveBeenCalledWith(taskId, statusUpdate);
    });

    it('should handle priority update only', async () => {
      const priorityUpdate: UpdateTaskDto = { priority: TaskPriority.LOW };
      const priorityUpdatedTask = { ...mockTask, priority: TaskPriority.LOW };
      jest.spyOn(service, 'updateTask').mockResolvedValue(priorityUpdatedTask);

      const result = await controller.updateTask(taskId, priorityUpdate);

      expect(result).toEqual(priorityUpdatedTask);
      expect(service.updateTask).toHaveBeenCalledWith(taskId, priorityUpdate);
    });
  });
});
