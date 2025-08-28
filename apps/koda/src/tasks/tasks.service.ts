import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { type UUID } from '@fubs/shared';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(projectId: UUID, createTaskDto: CreateTaskDto, userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const project = await this.prisma.project.findFirst({
        where: {
          id: projectId,
        },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      const task = await this.prisma.task.create({
        data: {
          ...createTaskDto,
          projectId,
          createdBy: userId,
        },
        include: {
          project: true,
          createdByUser: true,
          assignedUser: true,
        },
      });

      return task;
    } catch (error) {
      console.error('Error creating task:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException('Failed to create task');
    }
  }

  async findById(taskId: UUID) {
    return await this.prisma.task.findUnique({
      where: {
        id: taskId,
      },
      include: {
        project: true,
        createdByUser: true,
        assignedUser: true,
      },
    });
  }

  async findAllByProjectId(projectId: UUID) {
    return await this.prisma.task.findMany({
      where: {
        projectId,
      },
      include: {
        project: true,
        createdByUser: true,
        assignedUser: true,
      },
    });
  }

  async assignTaskToUser(taskId: UUID, userId: string) {
    const task = await this.prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        assignedTo: userId,
      },
      include: {
        project: true,
        createdByUser: true,
        assignedUser: true,
      },
    });

    return task;
  }

  async unassignTask(taskId: UUID, assignedUserId: UUID) {
    const task = await this.prisma.task.update({
      where: {
        id: taskId,
        assignedTo: assignedUserId,
      },
      data: {
        assignedTo: null,
      },
      include: {
        project: true,
        createdByUser: true,
        assignedUser: true,
      },
    });

    return task;
  }

  async deleteTask(taskId: UUID) {
    await this.prisma.task.delete({
      where: {
        id: taskId,
      },
    });

    return { message: 'Task deleted successfully' };
  }

  async updateTask(taskId: UUID, updateTaskDto: UpdateTaskDto) {
    const existingTask = await this.prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });

    if (!existingTask) {
      throw new NotFoundException('Task not found');
    }

    const task = await this.prisma.task.update({
      where: {
        id: taskId,
      },
      data: updateTaskDto,
      include: {
        project: true,
        createdByUser: true,
        assignedUser: true,
      },
    });

    return task;
  }
}
