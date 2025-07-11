import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';

import { JwtAuthGuard } from '@fubs/shared';
import type { AuthenticatedRequest } from '@fubs/shared';
import { type UUID } from '@fubs/shared';

@UseGuards(JwtAuthGuard)
@ApiTags('tasks')
@ApiBearerAuth()
@Controller('api/projects/:projectId/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task in a project' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  create(
    @Param('projectId') projectId: string,
    @Body() createTaskDto: CreateTaskDto,
    @Request() req: AuthenticatedRequest
  ) {
    const userId = req.user.id;
    try {
      return this.tasksService.create(projectId as UUID, createTaskDto, userId);
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  }
}
