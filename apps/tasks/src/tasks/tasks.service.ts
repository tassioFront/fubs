import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@fubs/shared";
import { CreateTaskDto } from "./dto/create-task.dto";
import { type UUID } from "@fubs/shared";

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}
  async create(
    projectId: UUID,
    createTaskDto: CreateTaskDto,
    userId: string
  ) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
      },
    });


    if (!project) {
      throw new NotFoundException("Project not found or access denied");
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
  }

  async findAllByProjectId(projectId: UUID) {
    const tasks = await this.prisma.task.findMany({
      where: {
        projectId,
      },
      include: {
        project: true,
        createdByUser: true,
        assignedUser: true,
      },
    });

    return tasks;
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

    if (!task) {
      throw new NotFoundException("Task not found");
    }

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

    if (!task) {
      throw new NotFoundException("Task not found");
    }

    return task;
  }

  async deleteTask(taskId: UUID) {
    const task = await this.prisma.task.delete({
      where: {
        id: taskId,
      },
    });

    if (!task) {
      throw new NotFoundException("Task not found");
    }

    return { message: "Task deleted successfully" };
  }
}
