import { CommentsService } from "./comments.service";
import {
  Controller,
  Post,
  Body,
  Param,
  Request,
  UseGuards,
  Get,
  Delete,
  Patch,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '@fubs/shared';
import { type UUID } from '@fubs/shared';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from "./dto/update-comment.dto";
import { WorkspaceMemberGuard } from '../auth/guards/workspace-member.guard';

import type { AuthenticatedRequest } from '@fubs/shared';

export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, WorkspaceMemberGuard)
  @ApiOperation({ summary: 'Create a comment' })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  createComment(@Body() createCommentDto: CreateCommentDto) {
    return this.commentsService.createComment(createCommentDto);
  }

  @Get(':taskId')
  @UseGuards(JwtAuthGuard, WorkspaceMemberGuard)
  @ApiOperation({ summary: 'Get comments by task ID' })
  @ApiResponse({ status: 200, description: 'Comments retrieved successfully' })
  getCommentsByTaskId(@Param('taskId') taskId: UUID) {
    return this.commentsService.getCommentsByTaskId(taskId);
  }

  @Patch(':commentId')
  @UseGuards(JwtAuthGuard, WorkspaceMemberGuard)
  @ApiOperation({ summary: 'Update a comment' })
  @ApiResponse({ status: 200, description: 'Comment updated successfully' })
  async updateComment(
    @Param('commentId') commentId: UUID,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req: AuthenticatedRequest
  ) {
    const userId = req.user.id;
    const comment = await this.commentsService.getCommentById(commentId);

    if (comment.createdBy !== userId) {
      throw new ForbiddenException('You are not allowed to update this comment');
    }

    return this.commentsService.updateComment(updateCommentDto);
  }

  @Delete(':commentId')
  @UseGuards(JwtAuthGuard, WorkspaceMemberGuard)
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
  async deleteComment(@Param('commentId') commentId: UUID, @Request() req: AuthenticatedRequest) {
    const userId = req.user.id;
    const comment = await this.commentsService.getCommentById(commentId);

    if (comment.createdBy !== userId) {
      throw new ForbiddenException('You are not allowed to delete this comment');
    }

    return this.commentsService.deleteComment(commentId);
  }
}
