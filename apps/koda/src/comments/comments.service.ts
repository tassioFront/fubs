import { CreateCommentDto } from "./dto/create-comment.dto";
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async createComment(createCommentDto: CreateCommentDto) {
    const { content, taskId, createdBy } = createCommentDto;

    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.prisma.taskComment.create({
      data: {
        content,
        taskId,
        createdBy,
      },
    });
  }
}

