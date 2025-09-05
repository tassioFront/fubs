import { CreateCommentDto } from "./dto/create-comment.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async createComment(createCommentDto: CreateCommentDto) {
    const { content, taskId, createdBy } = createCommentDto;

    return this.prisma.taskComment.create({
      data: {
        content,
        taskId,
        createdBy,
      },
    });
  }

  async getCommentById(commentId: string) {
    const comment = await this.prisma.taskComment.findUnique({
      where: { id: commentId },
    });

    return comment;
  }

  async getCommentsByTaskId(taskId: string) {
    return this.prisma.taskComment.findMany({
      where: { taskId },
    });
  }

  async deleteComment(commentId: string) {
    return this.prisma.taskComment.delete({
      where: { id: commentId },
    });
  }

  async updateComment(updateCommentDto: UpdateCommentDto) {
    const { commentId, content } = updateCommentDto;

    return this.prisma.taskComment.update({
      where: { id: commentId },
      data: { content },
    });
  }
}
