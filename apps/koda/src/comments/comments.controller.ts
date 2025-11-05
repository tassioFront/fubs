import { CommentsService } from './comments.service';
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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import {
  JwtAuthGuard,
  type UUID,
  type AuthenticatedRequest,
} from '@fubs/shared';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { WorkspaceMemberGuard } from '../auth/guards/workspace-member.guard';
import { ExistingCommentGuard } from './guards/existing-comment.guard';
import { ExistingTaskGuard } from './guards/existing-task.guard';

@ApiTags('comments')
@UseGuards(JwtAuthGuard, WorkspaceMemberGuard)
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a comment' })
  @UseGuards(ExistingTaskGuard)
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  createComment(@Body() createCommentDto: CreateCommentDto) {
    return this.commentsService.createComment(createCommentDto);
  }

  @Get(':taskId')
  @ApiOperation({ summary: 'Get comments by task ID' })
  @ApiResponse({ status: 200, description: 'Comments retrieved successfully' })
  getCommentsByTaskId(@Param('taskId') taskId: UUID) {
    return this.commentsService.getCommentsByTaskId(taskId);
  }

  @Patch(':commentId')
  @ApiOperation({ summary: 'Update a comment' })
  @UseGuards(ExistingCommentGuard)
  @ApiResponse({ status: 200, description: 'Comment updated successfully' })
  async updateComment(
    @Param('commentId') commentId: UUID,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req: AuthenticatedRequest
  ) {
    const userId = req.user.id;
    const comment = await this.commentsService.getCommentById(commentId);

    if (comment?.createdBy !== userId) {
      throw new ForbiddenException(
        'You are not allowed to update this comment'
      );
    }

    const updateDto = { ...updateCommentDto, commentId };
    return this.commentsService.updateComment(updateDto);
  }

  @Delete(':commentId')
  @ApiOperation({ summary: 'Delete a comment' })
  @UseGuards(ExistingCommentGuard)
  @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
  async deleteComment(
    @Param('commentId') commentId: UUID,
    @Request() req: AuthenticatedRequest
  ) {
    const userId = req.user.id;
    const comment = await this.commentsService.getCommentById(commentId);

    if (comment?.createdBy !== userId) {
      throw new ForbiddenException(
        'You are not allowed to delete this comment'
      );
    }

    return this.commentsService.deleteComment(commentId);
  }
}
