import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { type UUID } from '@fubs/shared';
import type { ProjectCreatedEvent } from '../app/interfaces/project-events.interface';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async createProject(projectData: ProjectCreatedEvent) {
    try {
      const project = await this.prisma.project.create({
        data: {
          id: projectData.id,
        },
      });

      console.log('✅ [tasks-service] Project saved:', project);
      return project;
    } catch (error: unknown) {
      console.error('❌ [tasks-service] Error saving project:', error);
      // If project already exists, just log and continue
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        console.log('⚠️ [tasks-service] Project already exists, skipping');
        return null;
      }
      throw error;
    }
  }

  async create(projectId: UUID, createTaskDto: CreateTaskDto, userId: string) {
    try {
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      await this.prisma.project.findFirst({
        where: {
          id: projectId,
        },
      });

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
      throw new NotFoundException('Project not found or user not authorized');
    }
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
