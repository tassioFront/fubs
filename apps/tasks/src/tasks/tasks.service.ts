import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@fubs/shared";
import { CreateTaskDto } from "./dto/create-task.dto";
import { Task } from "@prisma/client";
import { type UUID } from "@fubs/shared";

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}
  async create(
    projectId: UUID,
    createTaskDto: CreateTaskDto,
    userId: number
  ): Promise<Task> {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
      },
    });

    console.log("Project found:", project);

    if (!project) {
      throw new NotFoundException("Project not found or access denied");
    }

    const task: Task = await this.prisma.task.create({
      data: {
        ...createTaskDto,
        projectId,
        ownerId: userId,
      },
    });

    return task;
  }
}
